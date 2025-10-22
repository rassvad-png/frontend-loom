import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useProfileQuery } from '@/store';
import { useUpdateProfileMutation } from '@/store';
import { useApolloClient } from '@apollo/client/react';
import { GET_PROFILE } from '@/store/queries/queries';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Star,
  Settings,
  ArrowLeft,
} from 'lucide-react';
import { ProfileTab, SettingsTab, ActivityTab } from '@/components/Profile';
import type { Profile, ProfileCacheData } from '@/types';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const { profile, loading: profileLoading } = useProfileQuery(user?.id || '');
  const { updateProfile } = useUpdateProfileMutation();
  const apolloClient = useApolloClient();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'settings' || tab === 'actions') {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (profile) {
      // Sync language from DB to localStorage and i18n
      const dbLanguage = profile.language || 'en';
      const localLanguage = localStorage.getItem('language');

      if (dbLanguage !== localLanguage) {
        localStorage.setItem('language', dbLanguage);
        i18n.changeLanguage(dbLanguage);
      }

      // Apply theme from localStorage
      const localTheme = localStorage.getItem('theme') || 'light';
      if (localTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [profile, i18n]);

  const handleUpdateSettings = async (field: string, value: any) => {
    if (!user?.id) return;

    try {
      const updatedProfile = await updateProfile(user.id, { [field]: value });
      
      // Обновляем кэш Apollo вручную
      if (updatedProfile) {
        apolloClient.cache.updateQuery(
          { query: GET_PROFILE, variables: { userId: user.id } },
          (existingData: ProfileCacheData | null) => {
            if (existingData?.profilesCollection?.edges?.[0]?.node) {
              return {
                ...existingData,
                profilesCollection: {
                  ...existingData.profilesCollection,
                  edges: [{
                    ...existingData.profilesCollection.edges[0],
                    node: {
                      ...existingData.profilesCollection.edges[0].node,
                      [field]: value
                    }
                  }]
                }
              };
            }
            return existingData;
          }
        );
      }
      
      toast.success(t('profile.notifications.settingsUpdated'));
    } catch (error: any) {
      toast.error(t('profile.notifications.errorSettings'), {
        description: error.message,
      });
    }
  };

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-8 w-48 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-32 mt-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl mb-20">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
          </button>
          <h1 className="text-3xl font-bold">{t('profile.title')}</h1>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              {t('profile.tabs.profile')}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              {t('profile.tabs.settings')}
            </TabsTrigger>
            <TabsTrigger value="actions">
              <Star className="w-4 h-4 mr-2" />
              {t('profile.tabs.actions')}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileTab 
              profile={profile} 
              onUpdateProfile={handleUpdateSettings} 
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <SettingsTab 
              profile={profile} 
              onUpdateSettings={handleUpdateSettings} 
            />
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions">
            <ActivityTab userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
