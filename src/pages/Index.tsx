import { useState } from "react";
import { Layout } from "@/components/Layout";
import { LargeAppCard } from "@/components/LargeAppCard";
import { AppListItem } from "@/components/AppListItem";
import { BottomNav } from "@/components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppsQuery, useAppTranslationsQuery } from '@/store';


const Index = () => {
  const [activeTab, setActiveTab] = useState("today");

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

  // App Card Skeleton
  const AppCardSkeleton = () => (
    <div className="bg-card rounded-xl p-4 shadow-sm">
      <Skeleton className="w-full h-32 rounded-lg mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
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

  // Get apps from Apollo
  const { apps: rawApps, loading: appsLoading } = useAppsQuery(5);

  // Get app IDs for translations
  const appIds = rawApps.map(app => app.id);
  const { translations } = useAppTranslationsQuery(appIds);

  // Combine apps with translations
  const apps = rawApps.map(app => {
    const appTranslation = translations.find(t => t.app_id === app.id);
    return {
      ...app,
      icon: app.icon_url, // Map icon_url to icon
      name: appTranslation?.tagline || app.name || app.slug,
      description: appTranslation?.description || app.slug,
      fullDescription: appTranslation?.description || app.slug,
      reviews: [], // Add missing reviews field
      screenshots: app.screenshots || [], // Ensure screenshots is always an array
      category: app.categories?.[0] || 'general', // Take first category or default
    };
  });

  const loading = appsLoading;

  const appsWithScreenshots = apps.filter(app => app.screenshots && app.screenshots.length >= 2);
  const featuredApp = appsWithScreenshots[0] || apps[0];
  const trendingApps = apps.slice(1, 4);

  // Show loading state
  if (loading) {
    return (
      <Layout onSearch={() => {}}>
        <main className="container mx-auto px-4 py-8">
          <FeaturedCardSkeleton />
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6">Trending Apps</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <AppCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </main>
        <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      </Layout>
    );
  }

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
        {loading ? <FeaturedCardSkeleton /> : featuredApp ? <LargeAppCard app={featuredApp} /> : <FeaturedCardSkeleton />}

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
