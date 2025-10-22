import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Lock,
  Calendar,
  Heart,
  Star,
  MessageSquare,
  Code,
  Upload,
  ArrowLeft,
  DollarSign,
  Settings,
  ThumbsUp,
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
import AvatarCropDialog from '@/components/AvatarCropDialog';
import { DeveloperAccountDialog } from '@/components/DeveloperAccountDialog';

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  birth_date: string | null;
  display_name: string | null;
  avatar: string | null;
  favorite_categories: string[];
  country: string | null;
  language: string | null;
  theme: string | null;
}

interface Category {
  id: string;
  slug: string;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('');

  // Avatar crop state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

  // Developer account dialog state
  const [devDialogOpen, setDevDialogOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem('theme') || 'light'
  );

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
    if (user) {
      loadProfile();
      loadCategories();
      setEmail(user.email || '');
    }
  }, [user]);

  // Get current theme from localStorage
  const getCurrentTheme = () => localStorage.getItem('theme') || 'light';

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = getCurrentTheme();
    setCurrentTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const loadCategories = async () => {
    try {
      const categories = await apiClient.getCategories();

      setCategories(categories);
    } catch (error: any) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await apiClient.getProfile(user.id);

      if (profile) {
        setProfile(profile);
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
        setBirthDate(profile.birth_date || '');
        setDisplayName(profile.display_name || '');
        setCountry(profile.country || '');

        // Sync language from DB to localStorage and i18n
        const dbLanguage = profile.language || 'en';
        const localLanguage = localStorage.getItem('language');

        if (dbLanguage !== localLanguage) {
          localStorage.setItem('language', dbLanguage);
          i18n.changeLanguage(dbLanguage);
        }

        // Apply theme from localStorage
        const localTheme = getCurrentTheme();
        setCurrentTheme(localTheme);
        if (localTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error(t('profile.notifications.errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateName = (name: string) => {
    const re = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    return re.test(name);
  };

  const validateBirthDate = (date: string) => {
    const birthDate = new Date(date);
    const today = new Date();
    return birthDate <= today;
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) return;

    // Validation
    if (firstName && !validateName(firstName)) {
      toast.error(t('profile.notifications.invalidName'));
      return;
    }
    if (lastName && !validateName(lastName)) {
      toast.error(t('profile.notifications.invalidName'));
      return;
    }
    if (birthDate && !validateBirthDate(birthDate)) {
      toast.error(t('profile.notifications.invalidDate'));
      return;
    }

    setUpdating(true);
    try {
      await apiClient.updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || null,
        display_name: displayName,
        country: country,
      });

      toast.success(t('profile.notifications.profileUpdated'));
      loadProfile();
    } catch (error: any) {
      toast.error(t('profile.notifications.errorUpdate'), {
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateSettings = async (field: string, value: any) => {
    if (!user?.id) return;

    try {
      await apiClient.updateProfile(user.id, { [field]: value });

      toast.success(t('profile.notifications.settingsUpdated'));
      loadProfile();
    } catch (error: any) {
      toast.error(t('profile.notifications.errorSettings'), {
        description: error.message,
      });
    }
  };

  const toggleCategory = async (categoryId: string) => {
    if (!user?.id || !profile) return;

    const currentCategories = profile.favorite_categories || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    await handleUpdateSettings('favorite_categories', newCategories);
  };

  const handleLanguageChange = (language: string) => {
    localStorage.setItem('language', language);
    i18n.changeLanguage(language);
    handleUpdateSettings('language', language);
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

  const handleUpdateEmail = async () => {
    if (!user?.id || !email || email === user.email) return;

    if (!validateEmail(email)) {
      toast.error(t('profile.notifications.invalidEmail'));
      return;
    }

    setUpdating(true);
    try {
      await apiClient.updateUserEmail(email);

      toast.success(t('profile.notifications.emailUpdated'), {
        description: t('profile.notifications.emailConfirm'),
      });
    } catch (error: any) {
      toast.error(t('profile.notifications.errorEmail'), {
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user?.id || !newPassword || newPassword !== confirmPassword) {
      toast.error(t('profile.notifications.passwordMismatch'));
      return;
    }

    setUpdating(true);
    try {
      await apiClient.updateUserPassword(newPassword);

      toast.success(t('profile.notifications.passwordUpdated'));
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(t('profile.notifications.errorPassword'), {
        description: error.message,
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    if (!user?.id) return;

    setUploading(true);
    setCropDialogOpen(false);

    try {
      const filePath = `avatars/${user.id}.webp`;

      // Upload to storage
      const avatarUrl = await apiClient.uploadAvatar(croppedImage, user.id);

      // Update profile
      await apiClient.updateProfile(user.id, { avatar: avatarUrl });

      toast.success(t('profile.notifications.avatarUpdated'));
      loadProfile();
    } catch (error: any) {
      toast.error(t('profile.notifications.errorAvatar'), {
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (displayName) {
      return displayName.slice(0, 2).toUpperCase();
    }
    return user?.email?.slice(0, 2).toUpperCase() || '??';
  };

  const getAvatarColor = () => {
    const initials = getInitials();
    const hash = initials
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  if (authLoading || loading) {
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
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.userProfile.title')}</CardTitle>
                <CardDescription>
                  {t('profile.userProfile.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={profile?.avatar || ''} />
                    <AvatarFallback
                      style={{ backgroundColor: getAvatarColor() }}
                    >
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Label htmlFor="avatar-upload" className="cursor-pointer">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={uploading}
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading
                            ? t('profile.userProfile.uploading')
                            : t('profile.userProfile.uploadPhoto')}
                        </span>
                      </Button>
                    </Label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      {t('profile.userProfile.photoHint')}
                    </p>
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">
                    {t('profile.userProfile.displayName')}
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t(
                      'profile.userProfile.displayNamePlaceholder'
                    )}
                  />
                </div>

                {/* Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {t('profile.userProfile.firstName')}
                    </Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t(
                        'profile.userProfile.firstNamePlaceholder'
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {t('profile.userProfile.lastName')}
                    </Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t('profile.userProfile.lastNamePlaceholder')}
                    />
                  </div>
                </div>

                {/* Birth Date */}
                <div className="space-y-2">
                  <Label htmlFor="birthDate">
                    {t('profile.userProfile.birthDate')}
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="pl-10"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <Button onClick={handleUpdateProfile} disabled={updating}>
                  {updating
                    ? t('profile.userProfile.saving')
                    : t('profile.userProfile.saveProfile')}
                </Button>
              </CardContent>
            </Card>

            {/* Email & Password */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.security.title')}</CardTitle>
                <CardDescription>
                  {t('profile.security.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t('profile.security.email')}</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={handleUpdateEmail}
                      disabled={updating || email === user.email}
                      variant="outline"
                    >
                      {t('profile.security.changeEmail')}
                    </Button>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-4">
                  <Label>{t('profile.security.passwordChange')}</Label>
                  <div className="space-y-3">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('profile.security.newPassword')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder={t('profile.security.confirmPassword')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={updating || !newPassword}
                      variant="outline"
                    >
                      {t('profile.security.updatePassword')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
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
                      onBlur={() => handleUpdateSettings('country', country)}
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
                {loading ? (
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
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.actions.title')}</CardTitle>
                <CardDescription>
                  {t('profile.actions.description')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {t('profile.actions.donate')}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setDevDialogOpen(true)}
                >
                  <Code className="w-4 h-4 mr-2" />
                  {t('profile.actions.registerDev')}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Heart className="w-4 h-4 mr-2" />
                    {t('profile.actions.favorites')}
                  </Button>

                  <Button variant="outline" className="w-full justify-start">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {t('profile.actions.likes')}
                  </Button>
                </div>

                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('profile.actions.reviews')}
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  {t('profile.actions.ratings')}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AvatarCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
      />

      <DeveloperAccountDialog
        open={devDialogOpen}
        onClose={() => setDevDialogOpen(false)}
        userId={user.id}
      />
    </Layout>
  );
}
