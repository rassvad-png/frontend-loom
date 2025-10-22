import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Star, Download, Eye, MessageSquare, ThumbsUp, Upload, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";

interface AppStats {
  views: number;
  installs: number;
  likes: number;
  comments: number;
  rating: number;
}

interface AppData {
  id: string;
  slug: string;
  name: string | null;
  icon_url: string | null;
  screenshots: string[];
  categories: string[];
  verified: boolean;
  manifest_url: string | null;
  install_url: string | null;
  dev_account_id: string | null;
  url: string | null;
}

const DeveloperAppManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [app, setApp] = useState<AppData | null>(null);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [devAccountId, setDevAccountId] = useState<string | null>(null);
  
  // Form fields
  const [manifestUrl, setManifestUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [installUrl, setInstallUrl] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  useEffect(() => {
    if (user) {
      loadDevAccount();
    }
  }, [user]);

  useEffect(() => {
    if (id && devAccountId) {
      loadApp();
    }
  }, [id, devAccountId]);

  const loadDevAccount = async () => {
    try {
      const { data, error } = await supabase
        .from('dev_accounts')
        .select('id, status')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      if (data.status !== 'approved') {
        toast.error('Ваш аккаунт разработчика ещё не подтверждён');
        navigate('/developer');
        return;
      }

      setDevAccountId(data.id);
    } catch (err) {
      console.error('[Dev Account] Error:', err);
      toast.error('Ошибка загрузки аккаунта разработчика');
      navigate('/developer');
    }
  };

  const loadApp = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const { data: appData, error: appError } = await supabase
        .from('apps')
        .select('*')
        .eq('id', id)
        .eq('dev_account_id', devAccountId)
        .single();

      if (appError) throw appError;
      
      setApp(appData);
      
      // Load translations
      const { data: translations } = await supabase
        .from('app_translations')
        .select('*')
        .eq('app_id', id)
        .eq('lang', 'ru')
        .maybeSingle();

      if (translations) {
        setName(translations.tagline || appData.name || '');
        setDescription(translations.description || '');
      }
      
      setManifestUrl(appData.manifest_url || '');
      setCategory(appData.categories?.[0] || '');
      setInstallUrl(appData.install_url || '');

      // Load stats
      const { data: analytics } = await supabase
        .from('analytics')
        .select('event')
        .eq('app_id', id);

      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('app_id', id);

      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('app_id', id);

      const views = analytics?.filter(a => a.event === 'view').length || 0;
      const installs = analytics?.filter(a => a.event === 'install').length || 0;

      setStats({
        views,
        installs,
        likes: likesCount || 0,
        comments: commentsCount || 0,
        rating: appData.rating || 0
      });

    } catch (err) {
      console.error('[App Management] Error:', err);
      toast.error('Ошибка загрузки приложения');
    } finally {
      setLoading(false);
    }
  };

  const handleImportManifest = async () => {
    if (!manifestUrl) {
      toast.error('Введите URL манифеста');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) throw new Error('Не удалось загрузить манифест');
      
      const manifest = await response.json();
      
      // Auto-fill fields
      if (manifest.name || manifest.short_name) {
        setName(manifest.name || manifest.short_name);
      }
      
      if (manifest.description) {
        setDescription(manifest.description);
      }
      
      if (manifest.start_url) {
        setInstallUrl(manifest.start_url);
      }
      
      if (manifest.categories && manifest.categories.length > 0) {
        setCategory(manifest.categories[0]);
      }

      toast.success('Манифест успешно импортирован');
    } catch (err) {
      console.error('[Manifest Import] Error:', err);
      toast.error('Не удалось импортировать манифест');
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async () => {
    if (!name || !category) {
      toast.error('Заполните обязательные поля');
      return;
    }

    setSaving(true);
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      
      if (id && app) {
        // Update existing app
        const { error: updateError } = await supabase
          .from('apps')
          .update({
            slug,
            name,
            categories: [category],
            manifest_url: manifestUrl || null,
            install_url: installUrl || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (updateError) throw updateError;

        // Update translations
        const { error: transError } = await supabase
          .from('app_translations')
          .upsert({
            app_id: id,
            lang: 'ru',
            tagline: name,
            description: description,
            updated_at: new Date().toISOString()
          });

        if (transError) throw transError;

        toast.success('Приложение успешно обновлено');
      } else {
        // Create new app
        const { data: newApp, error: insertError } = await supabase
          .from('apps')
          .insert({
            slug,
            name,
            dev_account_id: devAccountId,
            categories: [category],
            manifest_url: manifestUrl || null,
            install_url: installUrl || null,
            verified: false
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // Create translations
        await supabase
          .from('app_translations')
          .insert({
            app_id: newApp.id,
            lang: 'ru',
            tagline: name,
            description: description
          });

        toast.success('Приложение успешно создано');
        navigate(`/developer/app/${newApp.id}`);
      }

      loadApp();
    } catch (err) {
      console.error('[Save App] Error:', err);
      toast.error('Ошибка сохранения приложения');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!app) return;

    try {
      const { error } = await supabase
        .from('apps')
        .update({ verified: true })
        .eq('id', app.id);

      if (error) throw error;

      toast.success('Приложение опубликовано');
      loadApp();
    } catch (err) {
      console.error('[Publish] Error:', err);
      toast.error('Ошибка публикации');
    }
  };

  const handleUnpublish = async () => {
    if (!app) return;

    try {
      const { error } = await supabase
        .from('apps')
        .update({ verified: false })
        .eq('id', app.id);

      if (error) throw error;

      toast.success('Приложение снято с публикации');
      loadApp();
    } catch (err) {
      console.error('[Unpublish] Error:', err);
      toast.error('Ошибка снятия с публикации');
    }
  };

  const handleDelete = async () => {
    if (!app) return;

    try {
      const { error } = await supabase
        .from('apps')
        .delete()
        .eq('id', app.id);

      if (error) throw error;

      toast.success('Приложение удалено');
      navigate('/developer');
    } catch (err) {
      console.error('[Delete] Error:', err);
      toast.error('Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/developer" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к кабинету разработчика
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {app ? 'Управление приложением' : 'Создание приложения'}
            </h1>
            {app && (
              <p className="text-muted-foreground">
                Статус: {app.verified ? (
                  <span className="text-green-600 font-medium">Опубликовано</span>
                ) : (
                  <span className="text-yellow-600 font-medium">Черновик</span>
                )}
              </p>
            )}
          </div>

          {app && (
            <div className="flex gap-2">
              {app.verified ? (
                <Button variant="outline" onClick={handleUnpublish}>
                  Снять с публикации
                </Button>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-primary to-purple-600"
                  onClick={handlePublish}
                >
                  Опубликовать
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Stats Cards (only for existing apps) */}
        {app && stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  Просмотры
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.views.toLocaleString('ru-RU')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Download className="w-4 h-4 text-muted-foreground" />
                  Установки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.installs.toLocaleString('ru-RU')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                  Лайки
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.likes.toLocaleString('ru-RU')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Комментарии
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.comments.toLocaleString('ru-RU')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  Рейтинг
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rating.toFixed(1)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* App Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Информация о приложении</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Manifest Import */}
            <div className="space-y-2">
              <Label htmlFor="manifestUrl">URL манифеста (необязательно)</Label>
              <div className="flex gap-2">
                <Input
                  id="manifestUrl"
                  value={manifestUrl}
                  onChange={(e) => setManifestUrl(e.target.value)}
                  placeholder="https://myapp.com/manifest.json"
                />
                <Button 
                  variant="outline"
                  onClick={handleImportManifest}
                  disabled={importing || !manifestUrl}
                >
                  {importing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Импортировать
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Импортируйте данные из manifest.json для автозаполнения полей
              </p>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="name">Название приложения *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Моё приложение"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Подробное описание вашего приложения..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="crypto">Crypto</SelectItem>
                  <SelectItem value="games">Игры</SelectItem>
                  <SelectItem value="business">Бизнес</SelectItem>
                  <SelectItem value="utilities">Утилиты</SelectItem>
                  <SelectItem value="productivity">Продуктивность</SelectItem>
                  <SelectItem value="lifestyle">Образ жизни</SelectItem>
                  <SelectItem value="music">Музыка</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installUrl">URL приложения</Label>
              <Input
                id="installUrl"
                value={installUrl}
                onChange={(e) => setInstallUrl(e.target.value)}
                type="url"
                placeholder="https://myapp.com"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-primary to-purple-600"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  'Сохранить'
                )}
              </Button>

              {app && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      Удалить приложение
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие нельзя отменить. Приложение и все связанные данные будут удалены навсегда.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeveloperAppManagement;
