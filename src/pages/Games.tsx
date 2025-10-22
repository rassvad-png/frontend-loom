import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { FeaturedCard } from "@/components/FeaturedCard";
import { AppListItem } from "@/components/AppListItem";
import { BottomNav } from "@/components/BottomNav";
import { mockApps } from "@/data/mockApps";

const categories = [
  { id: "puzzle", label: "Puzzle", icon: "🧩" },
  { id: "casual", label: "Casual", icon: "🎮" },
  { id: "simulation", label: "Simulation", icon: "🎯" },
  { id: "racing", label: "Racing", icon: "🏎️" },
];

const Games = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab] = useState("games");
  const [selectedCategory, setSelectedCategory] = useState("puzzle");

  // Map app IDs to genres for filtering
  const genreMap: Record<string, string> = {
    "5": "casual",
    "9": "puzzle",
    "10": "racing",
    "11": "simulation",
    "12": "casual",
    "13": "casual",
    "14": "puzzle",
    "15": "racing",
    "16": "simulation",
  };

  const gameApps = mockApps.filter(app => app.category === "Игры");
  const filteredGames = gameApps.filter((app: any) => genreMap[app.id] === selectedCategory);
  const featuredGame = filteredGames[0];

  return (
    <Layout>
    <div className="min-h-screen bg-background pb-20">
      {/* Content */}
      <main className="container mx-auto px-4 py-6 space-y-8">
        {/* Page Title */}
        <div>
          <h1 className="text-4xl font-bold">Games</h1>
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

        {/* Featured Game */}
        {featuredGame && (
          <section>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Сейчас доступно</p>
            <FeaturedCard app={featuredGame} />
          </section>
        )}

        {/* What We're Playing */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Во что мы играем</h2>
            <button className="text-primary text-sm font-medium">Все</button>
          </div>
          <div className="space-y-3">
            {filteredGames.slice(1, 4).map((app) => (
              <AppListItem key={app.id} app={app} />
            ))}
          </div>
        </section>

        {/* Popular Games */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Популярные игры</h2>
            <button className="text-primary text-sm font-medium">Все</button>
          </div>
          <div className="space-y-3">
            {filteredGames.slice(4).map((app) => (
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

export default Games;
