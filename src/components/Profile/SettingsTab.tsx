import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Languages,
  Palette,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategoriesQuery } from '@/store';
import type { Profile } from '@/types';

interface SettingsTabProps {
  profile: Profile | null;
  onUpdateSettings: (field: string, value: any) => Promise<void>;
}

export default function SettingsTab({ profile, onUpdateSettings }: SettingsTabProps) {
  const { t, i18n } = useTranslation();
  const { categories, loading: categoriesLoading } = useCategoriesQuery();
  const [country, setCountry] = useState(profile?.country || '');
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

  const toggleCategory = async (categoryId: string) => {
    if (!profile) return;

    const currentCategories = profile.favorite_categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    await onUpdateSettings('favorite_categories', newCategories);
  };

  const handleLanguageChange = (language: string) => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
    onUpdateSettings('language', language);
  };

  const handleThemeChange = (theme: string) => {
    localStorage.setItem('theme', theme);
    setCurrentTheme(theme);

    // Apply theme immediately
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile.regional.title')}</CardTitle>
          <CardDescription>
            {t('profile.regional.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">
              {t('profile.regional.country')}
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                onBlur={() => onUpdateSettings('country', country)}
                placeholder={t('profile.regional.countryPlaceholder')}
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">
              {t('profile.regional.language')}
            </Label>
            <div className="relative">
              <Languages className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
              <Select
                value={profile?.language || 'en'}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue
                    placeholder={t(
                      'profile.regional.languagePlaceholder'
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">
                    {t('profile.regional.languageRu')}
                  </SelectItem>
                  <SelectItem value="en">
                    {t('profile.regional.languageEn')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.appearance.title')}</CardTitle>
          <CardDescription>
            {t('profile.appearance.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="theme">{t('profile.appearance.theme')}</Label>
            <div className="relative">
              <Palette className="absolute left-3 top-3 w-4 h-4 text-muted-foreground z-10" />
              <Select
                value={currentTheme}
                onValueChange={handleThemeChange}
              >
                <SelectTrigger className="pl-10">
                  <SelectValue
                    placeholder={t('profile.appearance.themePlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    {t('profile.appearance.themeLight')}
                  </SelectItem>
                  <SelectItem value="dark">
                    {t('profile.appearance.themeDark')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('profile.categories.title')}</CardTitle>
          <CardDescription>
            {t('profile.categories.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categoriesLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => {
                const isSelected = profile?.favorite_categories?.includes(
                  category.id
                );
                return (
                  <Badge
                    key={category.id}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.slug}
                  </Badge>
                );
              })}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {t('profile.categories.noCategories')}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
