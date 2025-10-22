import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Search,
  User,
  LogOut,
  Settings,
  Code,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import { DeveloperAccountDialog } from '@/components/DeveloperAccountDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface LayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export const Layout = ({ children, onSearch }: LayoutProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [devAccount, setDevAccount] = useState<any>(null);
  const [devDialogOpen, setDevDialogOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchQuery);
  };

  useEffect(() => {
    const loadDevAccount = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('dev_accounts')
        .select('*')
        .eq('user_id', user.id)
        .single();

      setDevAccount(data);
    };

    loadDevAccount();
  }, [user]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Ошибка выхода', { description: error.message });
    } else {
      toast.success('Вы вышли из аккаунта');
      navigate('/');
    }
  };

  const handleDevAccountClick = () => {
    if (devAccount) {
      navigate('/developer-account');
    } else {
      setDevDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="w-full">
          <div className="mx-auto px-4 flex h-16 items-center gap-4 max-w-[1040px]">
            {/* Logo - visible on >= 1040px (lg), hidden on home page */}
            <Link
              to="/"
              className={`flex items-center gap-2 font-bold text-xl flex-shrink-0 ${'hidden lg:flex'}`}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Web Store
              </span>
            </Link>

            {/* Search Bar - responsive, centered on md+ */}
            <form
              onSubmit={handleSearch}
              className="flex-1 flex items-center md:justify-center max-w-2xl md:mx-auto"
            >
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Поиск приложений..."
                  className="pl-10 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>

            {/* User Actions - always visible, icon only on mobile */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 h-10">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {user.email?.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm hidden lg:inline">
                        {user.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/profile?tab=settings')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Настройки
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => navigate('/profile?tab=actions')}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Действия
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleDevAccountClick}>
                      <Code className="w-4 h-4 mr-2" />
                      Аккаунт разработчика
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="gap-2 h-10"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">Войти</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-8 max-w-[1040px]">
        {children}
      </main>

      {/* Developer Account Dialog */}
      {user && (
        <DeveloperAccountDialog
          open={devDialogOpen}
          onClose={() => setDevDialogOpen(false)}
          userId={user.id}
        />
      )}

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                © 2025 Web Store
              </span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">
                О нас
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Помощь
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Условия
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
