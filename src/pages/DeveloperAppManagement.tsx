import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Star, Download, Eye, MessageSquare, ThumbsUp, ExternalLink, Loader2, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useUserLanguage, useDevAccountQuery } from '@/store';
import { useAppQuery, useAppTranslationsQuery, useUpdateAppTranslationsMutation, useCategoriesQuery, useCreateAppMutation, useUpdateAppMutation, useDeleteAppMutation, useCheckAppSlug } from '@/store';
import type { AppStats } from '@/types';

const SLUG_REGEX = /[^a-z0-9-]/g;
const SLUG_CHECK_DELAY = 500;

const DeveloperAppManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const userLanguage = useUserLanguage();
  const { devAccount } = useDevAccountQuery(user?.id || '');
  
  const { app: rawApp, loading: appLoading } = useAppQuery(id || '');
  const { translations, loading: translationsLoading } = useAppTranslationsQuery(id ? [id] : []);
  const { updateAppTranslations } = useUpdateAppTranslationsMutation();
  const { createApp } = useCreateAppMutation();
  const { updateApp } = useUpdateAppMutation();
  const { deleteApp } = useDeleteAppMutation();
  const { categories, loading: categoriesLoading } = useCategoriesQuery();
  
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formUnlocked, setFormUnlocked] = useState(!!id);
  const [stats] = useState<AppStats | null>(null);
  const [currentLang, setCurrentLang] = useState<'ru' | 'en'>('ru');
  
  const [slug, setSlug] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { isAvailable: slugAvailable } = useCheckAppSlug(slug);
  
  const [manifestUrl, setManifestUrl] = useState("");
  const [name, setName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [installUrl, setInstallUrl] = useState("");
  
  const [taglineRu, setTaglineRu] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [descriptionRu, setDescriptionRu] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [whatsNewRu, setWhatsNewRu] = useState("");
  const [whatsNewEn, setWhatsNewEn] = useState("");
  
  const [iconUrl, setIconUrl] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>(["", "", "", "", ""]);

  const app = rawApp ? {
    id: rawApp.id,
    slug: rawApp.slug,
    name: rawApp.name,
    icon_url: rawApp.icon_url,
    screenshots: rawApp.screenshots || [],
    categories: rawApp.categories || [],
    verified: rawApp.verified || false,
    url: rawApp.url,
    install_url: rawApp.install_url,
    dev_account_id: devAccount?.id || null,
  } : null;

  useEffect(() => {
    if (rawApp) {
      setName(rawApp.name || '');
      setSlug(rawApp.slug || '');
      setSelectedCategories(rawApp.categories || []);
      setUrl(rawApp.url || '');
      setInstallUrl(rawApp.install_url || '');
      setIconUrl(rawApp.icon_url || '');
      setScreenshots(rawApp.screenshots?.slice(0, 5) || ["", "", "", "", ""]);
      setManifestUrl(rawApp.install_url || '');
      
      const ruTranslation = translations.find(t => t.lang === 'ru');
      const enTranslation = translations.find(t => t.lang === 'en');
      
      if (ruTranslation) {
        setTaglineRu(ruTranslation.tagline || '');
        setDescriptionRu(ruTranslation.description || '');
        setWhatsNewRu(ruTranslation.whats_new || '');
      }
      
      if (enTranslation) {
        setTaglineEn(enTranslation.tagline || '');
        setDescriptionEn(enTranslation.description || '');
        setWhatsNewEn(enTranslation.whats_new || '');
      }
    }
  }, [rawApp, translations]);

  const generateSlug = (appName: string) => {
    return appName.toLowerCase().replace(/\s+/g, '-').replace(SLUG_REGEX, '');
  };

  const handleNameChange = (value: string) => {
    setName(value);
    
    if (!id) {
      const newSlug = generateSlug(value);
      setSlug(newSlug);
      setSlugChecking(true);
      
      if (debounceRef.current) clearTimeout(debounceRef.current);
      
      if (newSlug) {
        debounceRef.current = setTimeout(() => {
          setSlugChecking(false);
        }, SLUG_CHECK_DELAY);
      } else {
        setSlugChecking(false);
      }
    }
  };

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
      
      if (manifest.name || manifest.short_name) {
        handleNameChange(manifest.name || manifest.short_name);
      }
      
      if (manifest.description) {
        setDescriptionRu(manifest.description);
        setDescriptionEn(manifest.description);
      }
      
      if (manifest.start_url) {
        setInstallUrl(manifest.start_url);
        setUrl(manifest.start_url);
      }
      
      if (manifest.categories?.length > 0) {
        setSelectedCategories(manifest.categories);
      }
      
      if (manifest.icons?.length > 0) {
        const maskableIcon = manifest.icons.find((i: any) => i.purpose?.includes('maskable'));
        const largeIcon = manifest.icons.find((i: any) => parseInt(i.sizes) >= 512);
        const mediumIcon = manifest.icons.find((i: any) => parseInt(i.sizes) >= 192);
        const selectedIcon = maskableIcon || largeIcon || mediumIcon || manifest.icons[0];
        
        if (selectedIcon?.src) {
          const iconSrc = selectedIcon.src.startsWith('http') 
            ? selectedIcon.src 
            : new URL(selectedIcon.src, manifestUrl).href;
          setIconUrl(iconSrc);
        }
      }
      
      if (manifest.screenshots?.length > 0) {
        const newScreenshots = manifest.screenshots.slice(0, 5).map((s: any) => {
          return s.src.startsWith('http') ? s.src : new URL(s.src, manifestUrl).href;
        });
        
        while (newScreenshots.length < 5) newScreenshots.push("");
        setScreenshots(newScreenshots);
      }

      setFormUnlocked(true);
      toast.success(t('devAppManagement.notifications.manifestImported'));
    } catch (err) {
      console.error('[Manifest Import] Error:', err);
      toast.error(t('devAppManagement.notifications.errorImport'));
    } finally {
      setImporting(false);
    }
  };

  const handleSave = async () => {
    if (!name || selectedCategories.length === 0 || !installUrl) {
      toast.error(t('devAppManagement.notifications.errorRequiredFields'));
      return;
    }
    
    if (!id && (!slugAvailable || slugChecking)) {
      toast.error('Slug недоступен или проверяется');
      return;
    }

    setSaving(true);
    try {
      const appData = {
        name,
        slug,
        categories: selectedCategories,
        url: url || installUrl,
        install_url: installUrl,
        icon_url: iconUrl,
        screenshots: screenshots.filter(s => s !== ""),
        verified: false,
        dev_account_id: devAccount?.id
      };
      
      let appId = id;
      
      if (id) {
        await updateApp(id, appData);
      } else {
        const newApp = await createApp(appData);
        appId = newApp.id;
      }
      
      if (appId) {
        if (taglineRu || descriptionRu || whatsNewRu) {
          await updateAppTranslations(appId, 'ru', {
            tagline: taglineRu,
            description: descriptionRu,
            whats_new: whatsNewRu
          });
        }
        
        if (taglineEn || descriptionEn || whatsNewEn) {
          await updateAppTranslations(appId, 'en', {
            tagline: taglineEn,
            description: descriptionEn,
            whats_new: whatsNewEn
          });
        }
      }

      toast.success(id ? t('devAppManagement.notifications.appUpdated') : t('devAppManagement.notifications.appCreated'));
      
      if (!id) navigate('/developer');
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
      await updateApp(app.id, { verified: true });
      toast.success(t('devAppManagement.notifications.appPublished'));
    } catch (err) {
      console.error('[Publish] Error:', err);
      toast.error(t('devAppManagement.notifications.errorPublish'));
    }
  };

  const handleUnpublish = async () => {
    if (!app) return;
    try {
      await updateApp(app.id, { verified: false });
      toast.success(t('devAppManagement.notifications.appUnpublished'));
    } catch (err) {
      console.error('[Unpublish] Error:', err);
      toast.error(t('devAppManagement.notifications.errorUnpublish'));
    }
  };

  const handleDelete = async () => {
    if (!app) return;
    try {
      await deleteApp(app.id);
      toast.success(t('devAppManagement.notifications.appDeleted'));
      navigate('/developer');
    } catch (err) {
      console.error('[Delete] Error:', err);
      toast.error(t('devAppManagement.notifications.errorDelete'));
    }
  };

  if (appLoading || translationsLoading || categoriesLoading) {
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
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
                <Button className="bg-gradient-to-r from-primary to-teal-500" onClick={handlePublish}>
                  {t('devAppManagement.publish')}
                </Button>
              )}
            </div>
          )}
        </div>

        {app && stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            {[
              { icon: Eye, label: 'views', value: stats.views },
              { icon: Download, label: 'installs', value: stats.installs },
              { icon: ThumbsUp, label: 'likes', value: stats.likes },
              { icon: MessageSquare, label: 'comments', value: stats.comments },
              { icon: Star, label: 'rating', value: stats.rating, isRating: true }
            ].map(({ icon: Icon, label, value, isRating }) => (
              <Card key={label}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${label === 'rating' ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                    {t(`devAppManagement.stats.${label}`)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {isRating ? value.toFixed(1) : value.toLocaleString('ru-RU')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{t('devAppManagement.form.title')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
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
                  disabled={importing || !manifestUrl || formUnlocked}
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><ExternalLink className="w-4 h-4 mr-2" />{t('devAppManagement.form.import')}</>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('devAppManagement.form.importHint')}</p>
            </div>

            {!formUnlocked && (
              <div className="bg-muted/50 border border-muted rounded-lg p-4 text-center text-sm text-muted-foreground">
                {t('devAppManagement.form.formLocked')}
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('devAppManagement.form.sectionBasic')}</h3>
              
              <div className="space-y-2">
                <Label htmlFor="name">{t('devAppManagement.form.name')}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={t('devAppManagement.form.namePlaceholder')}
                  disabled={!formUnlocked}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">{t('devAppManagement.form.slug')}</Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm min-h-[40px] flex items-center">
                    {slug || <span className="text-muted-foreground/50">{t('devAppManagement.form.slugHint')}</span>}
                  </div>
                  <div className="w-24 flex items-center justify-center text-sm">
                    {slugChecking ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-1" />{t('devAppManagement.form.slugChecking')}</>
                    ) : slugAvailable === true ? (
                      <><Check className="w-4 h-4 text-green-500 mr-1" />{t('devAppManagement.form.slugAvailable')}</>
                    ) : slugAvailable === false ? (
                      <><X className="w-4 h-4 text-red-500 mr-1" />{t('devAppManagement.form.slugTaken')}</>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('devAppManagement.form.categories')}</Label>
                <Select value={selectedCategories[0] || ""} onValueChange={(v) => setSelectedCategories([v])} disabled={!formUnlocked}>
                  <SelectTrigger><SelectValue placeholder={t('devAppManagement.form.categoriesPlaceholder')} /></SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>{t(`devAppManagement.categories.${cat.slug}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t('devAppManagement.form.url')}</Label>
                <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={t('devAppManagement.form.urlPlaceholder')} disabled={!formUnlocked} />
              </div>

              <div className="space-y-2">
                <Label>{t('devAppManagement.form.installUrl')}</Label>
                <Input value={installUrl} onChange={(e) => setInstallUrl(e.target.value)} placeholder={t('devAppManagement.form.installUrlPlaceholder')} disabled={!formUnlocked} required />
                <p className="text-xs text-muted-foreground">{t('devAppManagement.form.installUrlHint')}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('devAppManagement.form.sectionDescription')}</h3>
              
              <Tabs value={currentLang} onValueChange={(v) => setCurrentLang(v as 'ru' | 'en')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ru">{t('devAppManagement.form.languageRu')}</TabsTrigger>
                  <TabsTrigger value="en">{t('devAppManagement.form.languageEn')}</TabsTrigger>
                </TabsList>
                
                <TabsContent value="ru" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{t('devAppManagement.form.tagline')}</Label>
                    <Input value={taglineRu} onChange={(e) => setTaglineRu(e.target.value)} placeholder={t('devAppManagement.form.taglinePlaceholder')} disabled={!formUnlocked} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('devAppManagement.form.description')}</Label>
                    <Textarea value={descriptionRu} onChange={(e) => setDescriptionRu(e.target.value)} placeholder={t('devAppManagement.form.descriptionPlaceholder')} rows={6} disabled={!formUnlocked} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('devAppManagement.form.whatsNew')}</Label>
                    <Textarea value={whatsNewRu} onChange={(e) => setWhatsNewRu(e.target.value)} placeholder={t('devAppManagement.form.whatsNewPlaceholder')} rows={4} disabled={!formUnlocked} />
                  </div>
                </TabsContent>
                
                <TabsContent value="en" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>{t('devAppManagement.form.tagline')}</Label>
                    <Input value={taglineEn} onChange={(e) => setTaglineEn(e.target.value)} placeholder={t('devAppManagement.form.taglinePlaceholder')} disabled={!formUnlocked} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('devAppManagement.form.description')}</Label>
                    <Textarea value={descriptionEn} onChange={(e) => setDescriptionEn(e.target.value)} placeholder={t('devAppManagement.form.descriptionPlaceholder')} rows={6} disabled={!formUnlocked} />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('devAppManagement.form.whatsNew')}</Label>
                    <Textarea value={whatsNewEn} onChange={(e) => setWhatsNewEn(e.target.value)} placeholder={t('devAppManagement.form.whatsNewPlaceholder')} rows={4} disabled={!formUnlocked} />
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('devAppManagement.form.sectionMedia')}</h3>
              
              <div className="space-y-2">
                <Label>{t('devAppManagement.form.icon')}</Label>
                <p className="text-xs text-muted-foreground">{t('devAppManagement.form.iconHint')}</p>
                <div className="flex gap-4">
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden">
                    {iconUrl ? <img src={iconUrl} alt="Icon" className="w-full h-full object-cover" /> : <Plus className="w-8 h-8 text-muted-foreground" />}
                  </div>
                  <Input value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} placeholder="https://example.com/icon.png" disabled={!formUnlocked} className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('devAppManagement.form.screenshots')}</Label>
                <p className="text-xs text-muted-foreground">{t('devAppManagement.form.screenshotsHint')}</p>
                <div className="grid grid-cols-5 gap-2">
                  {screenshots.map((screenshot, i) => (
                    <div key={i} className="aspect-[460/997] border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden">
                      {screenshot ? <img src={screenshot} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" /> : <Plus className="w-6 h-6 text-muted-foreground" />}
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {screenshots.map((screenshot, i) => (
                    <Input key={i} value={screenshot} onChange={(e) => {
                      const newScreenshots = [...screenshots];
                      newScreenshots[i] = e.target.value;
                      setScreenshots(newScreenshots);
                    }} placeholder={`Screenshot ${i + 1} URL`} disabled={!formUnlocked} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleSave} disabled={saving || !formUnlocked} className="bg-gradient-to-r from-primary to-teal-500">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('devAppManagement.form.saving')}</> : t('devAppManagement.form.save')}
              </Button>

              {app && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">{t('devAppManagement.form.delete')}</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{t('devAppManagement.deleteDialog.title')}</AlertDialogTitle>
                      <AlertDialogDescription>{t('devAppManagement.deleteDialog.description')}</AlertDialogDescription>
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
