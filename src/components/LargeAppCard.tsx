import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Star } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

interface App {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rating: number;
  installs: number;
  screenshots?: string[];
}

interface LargeAppCardProps {
  app: App;
}

export const LargeAppCard = ({ app }: LargeAppCardProps) => {
  const navigate = useNavigate();
  const { logEvent } = useAnalytics();
  const { t } = useTranslation();

  // Only show if app has 2+ screenshots
  if (!app.screenshots || app.screenshots.length < 2) {
    return null;
  }

  // Filter vertical screenshots (aspect ratio > 1)
  const verticalScreenshots = app.screenshots.filter((_, index) => {
    // Assume all screenshots are vertical for now
    // In production, you'd check actual dimensions
    return true;
  });

  // Limit number of screenshots shown based on screen size
  const maxScreenshots = 4;
  const displayedScreenshots = verticalScreenshots.slice(0, maxScreenshots);
  const remainingCount = verticalScreenshots.length - displayedScreenshots.length;

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await logEvent(app.id, 'install', { source: 'large_app_card' });
    window.open(app.screenshots?.[0] || '#', '_blank');
  };

  const handleCardClick = async () => {
    await logEvent(app.id, 'click', { source: 'large_app_card' });
    navigate(`/app/${app.slug}`);
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
      onClick={handleCardClick}
    >
      {/* Screenshots Grid */}
      <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {displayedScreenshots.map((screenshot, index) => (
            <div 
              key={index}
              className="relative rounded-xl overflow-hidden aspect-[9/16] group"
            >
              <img
                src={screenshot}
                alt={`${app.name} screenshot ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              {index === displayedScreenshots.length - 1 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {t('largeAppCard.screenshotsRemaining', { count: remainingCount })}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Overlay Info */}
        <div className="absolute top-8 left-8 space-y-2">
          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
            {app.category}
          </Badge>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-medium">{app.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* App Info Footer */}
      <div className="p-4 md:p-6 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg">
            <img 
              src={app.icon} 
              alt={`${app.name} icon`}
              className="w-full h-full object-cover"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23e0e7ff"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="%236366f1"%3E${app.name[0]}%3C/text%3E%3C/svg%3E`;
              }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-2xl font-bold mb-1 line-clamp-1">{app.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{app.description}</p>
          </div>
        </div>
        
        <Button 
          size="lg"
          className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 flex-shrink-0"
          onClick={handleInstall}
        >
          <Download className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">{t('largeAppCard.install')}</span>
        </Button>
      </div>
    </Card>
  );
};
