import { useState } from "react";
import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LargeAppCard } from "@/components/LargeAppCard";
import { AppListItem } from "@/components/AppListItem";
import { BottomNav } from "@/components/BottomNav";
import { mockApps } from "@/data/mockApps";

const categories = [
  { id: "business", label: "Business", icon: "💼" },
  { id: "music", label: "Music", icon: "🎵" },
  { id: "lifestyle", label: "Lifestyle", icon: "🪑" },
  { id: "productivity", label: "Productivity", icon: "📊" },
];

const Apps = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab] = useState("apps");
  const [selectedCategory, setSelectedCategory] = useState("business");

  const appsList = mockApps.filter(app => app.category !== "Игры");
  const appsWithScreenshots = appsList.filter(app => app.screenshots && app.screenshots.length >= 2);
  const featuredApp = appsWithScreenshots[0] || appsList[0];

  return (<Layout>
    <div className="min-h-screen bg-background pb-20">
      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-bold">Apps</h1>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="flex-shrink-0"
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </Button>
          ))}
        </div>

        {/* Featured App */}
        {featuredApp && (
          <section>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Сейчас доступно</p>
            <LargeAppCard app={featuredApp} />
          </section>
        )}

        {/* Must-Have Apps */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Обязательные приложения</h2>
            <button className="text-primary text-sm font-medium">Все</button>
          </div>
          <div className="space-y-3">
            {appsList.slice(1, 4).map((app) => (
              <AppListItem key={app.id} app={app} />
            ))}
          </div>
        </section>

        {/* Essential Apps */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Основные приложения</h2>
            <button className="text-primary text-sm font-medium">Все</button>
          </div>
          <div className="space-y-3">
            {appsList.slice(4).map((app) => (
              <AppListItem key={app.id} app={app} />
            ))}
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={() => {}} />
    </div>
    </Layout>
  );
};

export default Apps;
