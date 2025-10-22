import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface FeaturedCardProps {
  app: App;
}

export const FeaturedCard = ({ app }: FeaturedCardProps) => {
  const navigate = useNavigate();
  const { logEvent } = useAnalytics();

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await logEvent(app.id, 'install', { source: 'featured_card' });
    window.open(app.screenshots?.[0] || '#', '_blank');
  };

  return (
    <Card 
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => navigate(`/app/${app.slug}`)}
    >
      <div className="relative h-48 md:h-64 overflow-hidden">
        {app?.screenshots?.[0] ? (
          <img
            src={app.screenshots[0]}
            alt={`${app.name} screenshot`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/30 to-transparent" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Сейчас в тренде</p>
            <h3 className="text-2xl md:text-3xl font-bold">{app.name}</h3>
            <p className="text-sm text-muted-foreground">{app.description}</p>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="p-4 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <img
            src={app.icon}
            alt={`${app.name} icon`}
            className="w-14 h-14 rounded-xl object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="font-semibold">{app.name}</p>
            <p className="text-sm text-muted-foreground">{app.category}</p>
          </div>
        </div>
        <Button 
          size="sm" 
          className="bg-primary hover:bg-primary/90"
          onClick={handleInstall}
        >
          Скачать
        </Button>
      </div>
    </Card>
  );
};
