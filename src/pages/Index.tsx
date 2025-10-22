import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { LargeAppCard } from "@/components/LargeAppCard";
import { AppListItem } from "@/components/AppListItem";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { mockApps } from "@/data/mockApps";
import { supabase } from "@/lib/supabaseClient";

const Index = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [apps, setApps] = useState(mockApps);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .limit(5);

        if (error) {
          console.error('[Supabase] Error loading apps:', error);
          return;
        }

        console.log('[Supabase] Connected successfully');
        console.log('[Supabase] Apps count:', data?.length || 0);

        if (data && data.length > 0) {
          // Load translations for all apps
          const appIds = data.map(app => app.id);
          const { data: translations } = await supabase
            .from('translations')
            .select('*')
            .eq('entity_type', 'app')
            .in('entity_id', appIds)
            .eq('lang', 'ru');

          // Map Supabase data to app format
          const supabaseApps = data.map((app: any) => {
            const appTranslations = translations?.filter(t => t.entity_id === app.id) || [];
            const nameTranslation = appTranslations.find(t => t.key === 'name');
            const descTranslation = appTranslations.find(t => t.key === 'description');

            return {
              id: app.id,
              slug: app.slug,
              name: nameTranslation?.value || app.slug,
              description: descTranslation?.value || app.slug,
              fullDescription: descTranslation?.value || app.slug,
              icon: app.icon_url || '/placeholder.svg',
              category: app.categories?.[0] || 'App',
              rating: app.rating || 0,
              installs: app.installs || 0,
              screenshots: app.screenshots || [],
              reviews: []
            };
          });
          setApps(supabaseApps);
        }
      } catch (err: any) {
        console.error('[Supabase] Connection error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadApps();
  }, []);

  const appsWithScreenshots = apps.filter(app => app.screenshots && app.screenshots.length >= 2);
  const featuredApp = appsWithScreenshots[0] || apps[0];
  const trendingApps = apps.slice(1, 4);

  // Featured Card Skeleton
  const FeaturedCardSkeleton = () => (
    <div className="bg-card rounded-2xl p-10 shadow-sm">
      <div className="flex items-center gap-6 mb-16">
        <Skeleton className="w-32 h-32 rounded-xl" />
        <div className="flex-1">
          <Skeleton className="h-8 w-80 mb-4" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
      <Skeleton className="h-6 w-full mb-7" />
      <Skeleton className="h-5 w-3/4" />
    </div>
  );

  // App List Item Skeleton
  const AppListItemSkeleton = () => (
    <div className="flex items-center gap-3 p-4 bg-card rounded-xl">
      <Skeleton className="w-16 h-16 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-6 w-24 mb-3" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );

  return (
    <Layout>
    <div className="min-h-screen bg-background pb-20">
      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Date Header */}
        <div>
          <h1 className="text-4xl font-bold mb-1">Today</h1>
          <p className="text-muted-foreground">{new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
        </div>

        {/* Featured App */}
        {loading ? <FeaturedCardSkeleton /> : <LargeAppCard app={featuredApp} />}

        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">В тренде</h2>
            <button className="text-primary text-sm font-medium">Все</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <AppListItemSkeleton key={i} />
              ))
            ) : (
              trendingApps.map((app) => (
                <AppListItem key={app.id} app={app} />
              ))
            )}
          </div>
        </section>

        {/* Featured Picks */}
        <section className="space-y-4">
          {loading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <FeaturedCardSkeleton key={i} />
            ))
          ) : null}
        </section>

        {/* Essentials Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Основное</h2>
            <button className="text-primary text-sm font-medium">Все</button>
          </div>
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <AppListItemSkeleton key={i} />
              ))
            ) : (
              apps.slice(4, 7).map((app) => (
                <AppListItem key={app.id} app={app} />
              ))
            )}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
    </Layout>
  );
};

export default Index;
