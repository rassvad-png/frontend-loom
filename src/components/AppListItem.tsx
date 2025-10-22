import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
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
}

interface AppListItemProps {
  app: App;
  className?: string;
}

export const AppListItem = ({ app, className }: AppListItemProps) => {
  const navigate = useNavigate();
  const { logEvent } = useAnalytics();

  const handleInstall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await logEvent(app.id, 'install', { source: 'app_list_item' });
    window.open('#', '_blank');
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
        className
      )}
      onClick={() => navigate(`/app/${app.slug}`)}
    >
      {/* App Icon */}
      <img
        src={app.icon}
        alt={`${app.name} icon`}
        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* App Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{app.name}</h3>
        <p className="text-sm text-muted-foreground truncate">{app.description}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
            <span className="text-xs text-muted-foreground">{app.rating}</span>
          </div>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{app.category}</span>
        </div>
      </div>

      {/* Get Button */}
      <Button 
        size="sm" 
        variant="secondary"
        className="flex-shrink-0"
        onClick={handleInstall}
      >
        Скачать
      </Button>
    </div>
  );
};
