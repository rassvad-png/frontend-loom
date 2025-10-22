import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Star, Download, Eye, MessageSquare, ThumbsUp, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserLanguage, useDevAccountQuery } from '@/store';
import { useAppQuery, useAppTranslationsQuery, useUpdateAppTranslationsMutation } from '@/store';
import type { AppStats } from '@/types';

const DeveloperAppManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const userLanguage = useUserLanguage();
  const { devAccount } = useDevAccountQuery(user?.id || '');
  
  // GraphQL hooks
  const { app: rawApp, loading: appLoading } = useAppQuery(id || '');
  const { translations, loading: translationsLoading } = useAppTranslationsQuery(id ? [id] : []);
  const { updateAppTranslations } = useUpdateAppTranslationsMutation();
  
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState<AppStats | null>(null);
  
  // Form fields
  const [manifestUrl, setManifestUrl] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [installUrl, setInstallUrl] = useState("");

  // Combine app data with translations
  const app = rawApp ? {
    id: rawApp.id,
    slug: rawApp.slug,
    name: rawApp.name,
    icon_url: rawApp.icon,
    screenshots: rawApp.screenshots || [],
    categories: rawApp.categories || [],
    verified: rawApp.verified || false,
    manifest_url: rawApp.install_url,
    install_url: rawApp.install_url,
    dev_account_id: devAccount?.id || null,
    url: rawApp.install_url
  } : null;

  // Update form fields when data changes
  useEffect(() => {
    if (rawApp) {
      const translation = translations[0];
      if (translation) {
        setName(translation.tagline || rawApp.name || '');
        setDescription(translation.description || '');
      } else {
        setName(rawApp.name || '');
        setDescription('');
      }
      
      setManifestUrl(rawApp.install_url || '');
      setCategory(rawApp.categories?.[0] || '');
      setInstallUrl(rawApp.install_url || '');
    }
  }, [rawApp, translations]);

  const handleImportManifest = async () => {
    if (!manifestUrl) {
      toast.error(t('devAppManagement.notifications.errorManifestUrl'));
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(manifestUrl);
      if (!response.ok) throw new Error(t('devAppManagement.notifications.errorManifestFetch'));
      
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

      toast.success(t('devAppManagement.notifications.manifestImported'));
    } catch (err) {
      console.error('[Manifest Import] Error:', err);
      toast.error(t('devAppManagement.notifications.errorImport'));
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async () => {
    if (!name || !category || !id) {
      toast.error(t('devAppManagement.notifications.errorRequiredFields'));
      return;
    }

    setSaving(true);
    try {
      // Update translations via GraphQL
      await updateAppTranslations(id, userLanguage, {
        tagline: name,
        description: description
      });

      toast.success(t('devAppManagement.notifications.appUpdated'));
    } catch (err) {
      console.error('[Save App] Error:', err);
      toast.error(t('devAppManagement.notifications.errorSave'));
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!app) return;

    try {
      // TODO: Implement publish mutation
      toast.success(t('devAppManagement.notifications.appPublished'));
    } catch (err) {
      console.error('[Publish] Error:', err);
      toast.error(t('devAppManagement.notifications.errorPublish'));
    }
  };

  const handleUnpublish = async () => {
    if (!app) return;

    try {
      // TODO: Implement unpublish mutation
      toast.success(t('devAppManagement.notifications.appUnpublished'));
    } catch (err) {
      console.error('[Unpublish] Error:', err);
      toast.error(t('devAppManagement.notifications.errorUnpublish'));
    }
  };

  const handleDelete = async () => {
    if (!app) return;

    try {
      // TODO: Implement delete mutation
      toast.success(t('devAppManagement.notifications.appDeleted'));
      navigate('/developer');
    } catch (err) {
      console.error('[Delete] Error:', err);
      toast.error(t('devAppManagement.notifications.errorDelete'));
    }
  };

  if (appLoading || translationsLoading) {
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
          {t('devAppManagement.backToDashboard')}
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {app ? t('devAppManagement.titleEdit') : t('devAppManagement.titleCreate')}
            </h1>
            {app && (
              <p className="text-muted-foreground">
                {t('devAppManagement.status')} {app.verified ? (
                  <span className="text-green-600 font-medium">{t('devAppManagement.statusPublished')}</span>
                ) : (
                  <span className="text-yellow-600 font-medium">{t('devAppManagement.statusDraft')}</span>
                )}
              </p>
            )}
          </div>

          {app && (
            <div className="flex gap-2">
              {app.verified ? (
                <Button variant="outline" onClick={handleUnpublish}>
                  {t('devAppManagement.unpublish')}
                </Button>
              ) : (
                <Button 
                  className="bg-gradient-to-r from-primary to-purple-600"
                  onClick={handlePublish}
                >
                  {t('devAppManagement.publish')}
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
                  {t('devAppManagement.stats.views')}
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
                  {t('devAppManagement.stats.installs')}
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
                  {t('devAppManagement.stats.likes')}
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
                  {t('devAppManagement.stats.comments')}
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
                  {t('devAppManagement.stats.rating')}
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
            <CardTitle>{t('devAppManagement.form.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Manifest Import */}
            <div className="space-y-2">
              <Label htmlFor="manifestUrl">{t('devAppManagement.form.manifestUrl')}</Label>
              <div className="flex gap-2">
                <Input
                  id="manifestUrl"
                  value={manifestUrl}
                  onChange={(e) => setManifestUrl(e.target.value)}
                  placeholder={t('devAppManagement.form.manifestUrlPlaceholder')}
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
                      {t('devAppManagement.form.import')}
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('devAppManagement.form.importHint')}
              </p>
            </div>

            {/* Basic Info */}
            <div className="space-y-2">
              <Label htmlFor="name">{t('devAppManagement.form.name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('devAppManagement.form.namePlaceholder')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('devAppManagement.form.description')}</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('devAppManagement.form.descriptionPlaceholder')}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">{t('devAppManagement.form.category')}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder={t('devAppManagement.form.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai">{t('devAppManagement.categories.ai')}</SelectItem>
                  <SelectItem value="crypto">{t('devAppManagement.categories.crypto')}</SelectItem>
                  <SelectItem value="games">{t('devAppManagement.categories.games')}</SelectItem>
                  <SelectItem value="business">{t('devAppManagement.categories.business')}</SelectItem>
                  <SelectItem value="utilities">{t('devAppManagement.categories.utilities')}</SelectItem>
                  <SelectItem value="productivity">{t('devAppManagement.categories.productivity')}</SelectItem>
                  <SelectItem value="lifestyle">{t('devAppManagement.categories.lifestyle')}</SelectItem>
                  <SelectItem value="music">{t('devAppManagement.categories.music')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="installUrl">{t('devAppManagement.form.installUrl')}</Label>
              <Input
                id="installUrl"
                value={installUrl}
                onChange={(e) => setInstallUrl(e.target.value)}
                type="url"
                placeholder={t('devAppManagement.form.installUrlPlaceholder')}
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
                    {t('devAppManagement.form.saving')}
                  </>
                ) : (
                  t('devAppManagement.form.save')
                )}
              </Button>

              {app && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      {t('devAppManagement.form.delete')}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('devAppManagement.deleteDialog.title')}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {t('devAppManagement.deleteDialog.description')}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t('devAppManagement.deleteDialog.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                        {t('devAppManagement.deleteDialog.confirm')}
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
