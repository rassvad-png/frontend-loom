import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Download, ArrowLeft, ExternalLink, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAppQuery, useAppTranslationsQuery } from '@/store';

interface AppData {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  whatsNew?: string;
  icon: string;
  category: string;
  rating: number;
  installs: number;
  screenshots: string[];
  installUrl?: string;
}

const AppDetails = () => {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { logEvent } = useAnalytics();
  
  // Get app data from Apollo
  const { app: rawApp, loading: appLoading, error: appError } = useAppQuery(slug || '');
  
  // Get translations for the current app
  const { translations, loading: translationsLoading } = useAppTranslationsQuery(
    rawApp?.id ? [rawApp.id] : []
  );

  // Combine app data with translations
  const app = rawApp ? {
    ...rawApp,
    icon: rawApp.icon_url,
    name: rawApp.name || rawApp.slug,
    description: rawApp.slug,
    fullDescription: rawApp.slug,
    screenshots: rawApp.screenshots || [],
    category: rawApp.categories?.[0] || 'general',
    tagline: rawApp.slug,
    whatsNew: t('appDetails.defaultWhatsNew'),
  } : null;

  // Apply translations when they change
  useEffect(() => {
    if (app && translations.length > 0) {
      const translation = translations[0];
      // Update app with translations
      Object.assign(app, {
        name: translation?.tagline || app.name || app.slug,
        tagline: translation?.tagline || app.slug,
        description: translation?.description || app.slug,
        fullDescription: translation?.description || app.slug,
        whatsNew: translation?.whats_new || t('appDetails.defaultWhatsNew'),
      });
    }
  }, [translations, t]);

  const loading = appLoading || translationsLoading;

  // Log view event when app loads
  useEffect(() => {
    if (app?.id) {
      logEvent(app.id, 'view', { source: 'app_details' });
    }
  }, [app?.id]); // Remove logEvent from dependencies

  const handleInstall = async () => {
    if (!app) return;
    await logEvent(app.id, 'install', { source: 'app_details' });
    
    if (app.installUrl) {
      window.open(app.installUrl, '_blank');
    } else {
      window.open('#', '_blank');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-4 w-32 mb-6" />
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="w-32 h-32 rounded-3xl" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-6">
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-24" />
                  </div>
                  <Skeleton className="h-11 w-48" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (appError || !app) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('appDetails.appNotFound')}</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('appDetails.returnHome')}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const formatInstalls = (installs: number) => {
    if (installs >= 1000000) return `${(installs / 1000000).toFixed(1)}M`;
    if (installs >= 1000) return `${(installs / 1000).toFixed(1)}K`;
    return installs.toString();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('appDetails.backToCatalog')}
        </Link>

        {/* App Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* App Icon */}
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xl">
              <img 
                src={app.icon} 
                alt={app.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="128" height="128"%3E%3Crect width="128" height="128" fill="%23e0e7ff"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="48" fill="%236366f1"%3E${app.name[0]}%3C/text%3E%3C/svg%3E`;
                }}
              />
            </div>

            {/* App Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{app.name}</h1>
                  <Badge variant="secondary" className="text-sm mb-3">
                    {app.category}
                  </Badge>
                  <p className="text-lg text-muted-foreground mb-4">{app.tagline}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mb-6">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="w-5 h-5 fill-accent text-accent" />
                    <span className="text-2xl font-bold">{app.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('appDetails.rating')}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Download className="w-5 h-5 text-muted-foreground" />
                    <span className="text-2xl font-bold">{formatInstalls(app.installs)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('appDetails.installs')}</p>
                </div>
              </div>

              {/* Action Button */}
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 w-full md:w-auto"
                onClick={handleInstall}
              >
                <Download className="w-5 h-5 mr-2" />
                {t('appDetails.installApp')}
              </Button>
            </div>
          </div>
        </div>

        {/* Screenshots - Full Width Horizontal Scroll */}
        {app.screenshots && app.screenshots.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">{t('appDetails.screenshots')}</h2>
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                {app.screenshots.map((screenshot, index) => (
                  <div 
                    key={index} 
                    className="flex-shrink-0 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    style={{ width: '280px', height: '600px' }}
                  >
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('appDetails.description')}</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            {app.fullDescription}
          </p>
        </div>

        {/* What's New */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('appDetails.whatsNew')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {app.whatsNew}
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('appDetails.statistics')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-6 h-6 fill-accent text-accent" />
                  <span className="text-3xl font-bold">{app.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{t('appDetails.rating')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('appDetails.outOf')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Download className="w-6 h-6 text-muted-foreground" />
                  <span className="text-3xl font-bold">{formatInstalls(app.installs)}+</span>
                </div>
                <p className="text-sm text-muted-foreground">{t('appDetails.installs')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('appDetails.total')}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold mb-2">{app.category}</div>
                <p className="text-sm text-muted-foreground">{t('appDetails.category')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('appDetails.progressiveWebApp')}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('appDetails.userReviews')}</h2>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {t('appDetails.noReviews')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Support */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">{t('appDetails.support')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="w-full justify-start h-12">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('appDetails.developerWebsite')}
            </Button>
            <Button variant="outline" className="w-full justify-start h-12">
              <ExternalLink className="w-4 h-4 mr-2" />
              {t('appDetails.privacyPolicy')}
            </Button>
          </div>
        </div>

        {/* You Might Also Like */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">{t('appDetails.youMightAlsoLike')}</h2>
            <Button variant="ghost" className="text-primary">
              {t('appDetails.all')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for similar apps */}
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">A</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('appDetails.similarApp')}</h3>
                  <p className="text-sm text-muted-foreground">{t('appDetails.category')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">B</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('appDetails.anotherApp')}</h3>
                  <p className="text-sm text-muted-foreground">{t('appDetails.category')}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">C</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{t('appDetails.thirdApp')}</h3>
                  <p className="text-sm text-muted-foreground">{t('appDetails.category')}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppDetails;
