import { useNavigate, useLocation } from "react-router-dom";
import { FileText, Gamepad2, Layers3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "today", label: "Today", icon: FileText, path: "/" },
    { id: "games", label: "Games", icon: Gamepad2, path: "/games" },
    { id: "apps", label: "Apps", icon: Layers3, path: "/apps" },
  ];

  const handleTabClick = (tab: typeof tabs[0]) => {
    onTabChange(tab.id);
    navigate(tab.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname === tab.path;
            
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-6 py-2 transition-colors",
                  isActive ? "" : "text-muted-foreground"
                )}
              >
                <Icon className={cn(
                  "w-6 h-6",
                  isActive ? "text-primary" : ""
                )} />
                <span className={cn(
                  "text-xs font-medium",
                  isActive ? "bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent" : ""
                )}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
