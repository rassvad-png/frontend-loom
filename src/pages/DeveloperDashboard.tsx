import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Star, Download, TrendingUp, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from '@/lib/api';
import { useAuth } from "@/hooks/useAuth";

interface DeveloperApp {
  id: string;
  slug: string;
  name: string | null;
  icon_url: string | null;
  rating: number;
  installs: number;
  categories: string[];
  verified: boolean;
}

interface DevAccount {
  id: string;
  status: string;
  org_name: string | null;
}

const DeveloperDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { t } = useTranslation();
  const [developerApps, setDeveloperApps] = useState<DeveloperApp[]>([]);
  const [devAccount, setDevAccount] = useState<DevAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && user) {
      loadDevAccount();
    } else if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading]);

  const loadDevAccount = async () => {
    try {
      const devAccount = await apiClient.getDevAccount(user?.id || '');

      if (!devAccount) {
        console.error('[Dev Account] No account found');
        toast.error(t('devDashboard.notifications.errorLoadingAccount'));
        return;
      }

      setDevAccount(devAccount);
      
      if (devAccount) {
        loadDeveloperApps(devAccount.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('[Dev Account] Error:', err);
      toast.error(t('devDashboard.notifications.errorConnection'));
      setLoading(false);
    }
  };

  const loadDeveloperApps = async (devAccountId: string) => {
    try {
      const apps = await apiClient.getDeveloperApps(devAccountId);
      setDeveloperApps(apps);
    } catch (err) {
      console.error('[Developer Dashboard] Error:', err);
      toast.error(t('devDashboard.notifications.errorConnection'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = () => {
    if (!devAccount || devAccount.status !== 'approved') {
      return;
    }
    navigate('/developer/app/new');
  };

  const totalInstalls = developerApps.reduce((sum, app) => sum + app.installs, 0);
  const avgRating = developerApps.length > 0 
    ? (developerApps.reduce((sum, app) => sum + app.rating, 0) / developerApps.length).toFixed(1)
    : '0.0';

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">{t('devDashboard.title')}</h1>
            <p className="text-muted-foreground">{t('devDashboard.subtitle')}</p>
          </div>
          <Button 
            className="bg-gradient-to-r from-primary to-purple-600"
            onClick={handleCreateApp}
            disabled={!devAccount || devAccount.status !== 'approved'}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('devDashboard.addApp')}
          </Button>
        </div>

        {/* Pending Account Banner */}
        {devAccount && devAccount.status === 'pending' && (
          <Alert className="mb-8 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
            <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="ml-2">
              <div className="space-y-2">
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {t('devDashboard.pendingBanner.title')}
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('devDashboard.pendingBanner.description')}
                </p>
                <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  <Clock className="w-4 h-4" />
                  <span>{t('devDashboard.pendingBanner.waiting')}</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('devDashboard.stats.totalInstalls')}</CardTitle>
              <Download className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalInstalls.toLocaleString('ru-RU')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                {t('devDashboard.stats.monthGrowth')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('devDashboard.stats.avgRating')}</CardTitle>
              <Star className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgRating}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('devDashboard.stats.outOf')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('devDashboard.stats.apps')}</CardTitle>
              <Plus className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{developerApps.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{t('devDashboard.stats.published')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Apps List */}
        <Card>
          <CardHeader>
            <CardTitle>{t('devDashboard.appsList.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">{t('devDashboard.appsList.loading')}</div>
            ) : developerApps.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t('devDashboard.appsList.empty')}
              </div>
            ) : (
              <div className="space-y-4">
                {developerApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {app.icon_url ? (
                        <img 
                          src={app.icon_url} 
                          alt={app.slug}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {app.slug[0]?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{app.name || app.slug}</h3>
                        {app.verified && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                            {t('devDashboard.appsList.statusPublished')}
                          </span>
                        )}
                        {!app.verified && (
                          <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                            {t('devDashboard.appsList.statusDraft')}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                        {app.categories?.[0] || t('devDashboard.appsList.categoryFallback')}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="flex items-center gap-1 font-medium">
                          <Star className="w-4 h-4 fill-accent text-accent" />
                          {app.rating.toFixed(1)}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('devDashboard.appsList.rating')}</p>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">
                          {app.installs >= 1000 ? `${(app.installs / 1000).toFixed(0)}K` : app.installs}
                        </div>
                        <p className="text-xs text-muted-foreground">{t('devDashboard.appsList.installs')}</p>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/developer/app/${app.id}`)}
                    >
                      {t('devDashboard.appsList.edit')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default DeveloperDashboard;
