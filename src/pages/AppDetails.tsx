import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Download, ArrowLeft, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { useAnalytics } from "@/hooks/useAnalytics";

interface AppData {
  id: string;
  slug: string;
  name: string;
  description: string;
  fullDescription: string;
  icon: string;
  category: string;
  rating: number;
  installs: number;
  screenshots: string[];
  installUrl?: string;
}

const AppDetails = () => {
  const { slug } = useParams();
  const { logEvent } = useAnalytics();
  const [app, setApp] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAppDetails();
  }, [slug]);

  const loadAppDetails = async () => {
    if (!slug) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        console.error('[App Details] Error:', error);
        setApp(null);
      } else {
        // Load translations for name and description
        const { data: translations } = await supabase
          .from('translations')
          .select('*')
          .eq('entity_type', 'app')
          .eq('entity_id', data.id)
          .eq('lang', 'ru');

        const getName = () => {
          const nameTranslation = translations?.find(t => t.key === 'name');
          return nameTranslation?.value || data.slug;
        };

        const getDescription = () => {
          const descTranslation = translations?.find(t => t.key === 'description');
          return descTranslation?.value || data.slug;
        };

        // Map Supabase data to app format
        setApp({
          id: data.id,
          slug: data.slug,
          name: getName(),
          description: getDescription(),
          fullDescription: getDescription(),
          icon: data.icon_url || '/placeholder.svg',
          category: data.categories?.[0] || 'App',
          rating: data.rating || 0,
          installs: data.installs || 0,
          screenshots: data.screenshots || [],
          installUrl: data.install_url
        });
      }

      // Log view event
      await logEvent(data?.id || slug, 'view', { source: 'app_details' });
    } catch (err) {
      console.error('[App Details] Error:', err);
      setApp(null);
    } finally {
      setLoading(false);
    }
  };

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

  if (!app) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Приложение не найдено</h1>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться на главную
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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к каталогу
        </Link>

        {/* App Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
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
                    <Badge variant="secondary" className="text-sm">
                      {app.category}
                    </Badge>
                  </div>
                </div>

                <p className="text-muted-foreground mb-6">{app.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-6">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Star className="w-5 h-5 fill-accent text-accent" />
                      <span className="text-2xl font-bold">{app.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Рейтинг</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Download className="w-5 h-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{formatInstalls(app.installs)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Установок</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 w-full md:w-auto"
                  onClick={handleInstall}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Установить приложение
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Screenshots */}
            <Card>
              <CardHeader>
                <CardTitle>Скриншоты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {app.screenshots?.map((screenshot, index) => (
                    <div key={index} className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                      <img
                        src={screenshot}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Описание</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {app.fullDescription}
                </p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Отзывы пользователей</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Пока нет отзывов для этого приложения
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Категория</p>
                  <p className="font-medium">{app.category}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Установок</p>
                  <p className="font-medium">{formatInstalls(app.installs)}+</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Рейтинг</p>
                  <p className="font-medium">{app.rating} ⭐</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Тип</p>
                  <p className="font-medium">Progressive Web App</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Поддержка</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Сайт разработчика
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Политика конфиденциальности
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AppDetails;
