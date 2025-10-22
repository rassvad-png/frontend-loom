import { Link } from "react-router-dom";
import { Star, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";

export interface App {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  rating: number;
  installs: number;
  category: string;
}

interface AppCardProps {
  app: App;
}

export const AppCard = ({ app }: AppCardProps) => {
  const { logEvent } = useAnalytics();

  const formatInstalls = (installs: number) => {
    if (installs >= 1000000) return `${(installs / 1000000).toFixed(1)}M`;
    if (installs >= 1000) return `${(installs / 1000).toFixed(1)}K`;
    return installs.toString();
  };

  const handleInstall = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await logEvent(app.id, 'install', { source: 'app_card' });
    window.open('#', '_blank');
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-6">
        <Link to={`/app/${app.slug}`} className="flex flex-col h-full">
          {/* App Icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
              <img 
                src={app.icon} 
                alt={app.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23e0e7ff"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="24" fill="%236366f1"%3E${app.name[0]}%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                {app.category}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
            {app.description}
          </p>

          {/* Stats & Action */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-medium">{app.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Download className="w-4 h-4" />
                <span>{formatInstalls(app.installs)}</span>
              </div>
            </div>
            
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90"
              onClick={handleInstall}
            >
              Скачать
            </Button>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};
