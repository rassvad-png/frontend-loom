import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Star, Download, TrendingUp, Upload } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

interface DeveloperApp {
  id: string;
  slug: string;
  icon_url: string | null;
  rating: number;
  installs: number;
  categories: string[];
}

const DeveloperDashboard = () => {
  const [isAddAppOpen, setIsAddAppOpen] = useState(false);
  const [developerApps, setDeveloperApps] = useState<DeveloperApp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeveloperApps();
  }, []);

  const loadDeveloperApps = async () => {
    try {
      // TODO: Filter by actual developer_id when auth is implemented
      const { data, error } = await supabase
        .from('apps')
        .select('id, slug, icon_url, rating, installs, categories')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Developer Dashboard] Error loading apps:', error);
        toast.error('Не удалось загрузить приложения');
        return;
      }

      setDeveloperApps(data || []);
    } catch (err) {
      console.error('[Developer Dashboard] Error:', err);
      toast.error('Ошибка подключения');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const { error } = await supabase
        .from('apps')
        .insert({
          slug: formData.get('name')?.toString().toLowerCase().replace(/\s+/g, '-') || '',
          icon_url: null, // TODO: Upload icon
          categories: [formData.get('category')?.toString() || 'Утилиты'],
          install_url: formData.get('url')?.toString() || '',
          verified: false
        });

      if (error) {
        console.error('[Developer Dashboard] Error adding app:', error);
        toast.error('Не удалось добавить приложение');
        return;
      }

      toast.success("Приложение успешно добавлено!");
      setIsAddAppOpen(false);
      loadDeveloperApps();
    } catch (err) {
      console.error('[Developer Dashboard] Error:', err);
      toast.error('Ошибка при добавлении');
    }
  };

  const totalInstalls = developerApps.reduce((sum, app) => sum + app.installs, 0);
  const avgRating = developerApps.length > 0 
    ? (developerApps.reduce((sum, app) => sum + app.rating, 0) / developerApps.length).toFixed(1)
    : '0.0';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Кабинет разработчика</h1>
            <p className="text-muted-foreground">Управляйте своими приложениями</p>
          </div>
          <Dialog open={isAddAppOpen} onOpenChange={setIsAddAppOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                Добавить приложение
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Добавить новое приложение</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Название приложения</Label>
                  <Input id="name" name="name" placeholder="Мое приложение" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Краткое описание</Label>
                  <Input id="description" name="description" placeholder="Краткое описание приложения" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Подробное описание</Label>
                  <Textarea
                    id="fullDescription"
                    name="fullDescription"
                    placeholder="Подробное описание вашего приложения..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Категория</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai">AI</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="games">Игры</SelectItem>
                      <SelectItem value="business">Бизнес</SelectItem>
                      <SelectItem value="utilities">Утилиты</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL приложения</Label>
                  <Input id="url" name="url" type="url" placeholder="https://myapp.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Иконка приложения</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Нажмите для загрузки или перетащите файл
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG (рекомендуется 512x512px)</p>
                    <Input id="icon" type="file" accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshots">Скриншоты</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Загрузите скриншоты (можно несколько)
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG (рекомендуется 1920x1080px)</p>
                    <Input id="screenshots" type="file" accept="image/*" multiple className="hidden" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-purple-600">
                    Добавить приложение
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddAppOpen(false)}>
                    Отмена
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Всего установок</CardTitle>
              <Download className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalInstalls.toLocaleString('ru-RU')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                +12.5% за месяц
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating}</div>
              <p className="text-xs text-muted-foreground mt-1">Из 5.0 возможных</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Приложений</CardTitle>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{developerApps.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Опубликовано</p>
            </CardContent>
          </Card>
        </div>

        {/* Apps List */}
        <Card>
          <CardHeader>
            <CardTitle>Ваши приложения</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : developerApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Пока нет приложений. Добавьте первое!
              </div>
            ) : (
              <div className="space-y-4">
                {developerApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {app.icon_url ? (
                        <img 
                          src={app.icon_url} 
                          alt={app.slug}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {app.slug[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{app.slug}</h3>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {app.categories?.[0] || 'Приложение'}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          {app.rating.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">Рейтинг</p>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {app.installs >= 1000 ? `${(app.installs / 1000).toFixed(0)}K` : app.installs}
                        </div>
                        <p className="text-xs text-muted-foreground">Установок</p>
                      </div>
                    </div>

                    <Button variant="outline" size="sm">
                      Редактировать
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
