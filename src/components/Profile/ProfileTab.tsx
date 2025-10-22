import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import {
  Calendar,
  Mail,
  Lock,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfileMutation } from '@/store';
import { authClient } from '@/lib/auth';
import AvatarCropDialog from '@/components/AvatarCropDialog';
import type { Profile } from '@/types';

interface ProfileTabProps {
  profile: Profile | null;
  onUpdateProfile: (field: string, value: any) => Promise<void>;
}

export default function ProfileTab({ profile, onUpdateProfile }: ProfileTabProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const { updateProfile, loading: updateLoading } = useUpdateProfileMutation();
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [birthDate, setBirthDate] = useState(profile?.birth_date || '');
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Avatar crop state
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState('');

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
      await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        birth_date: birthDate || null,
        display_name: displayName,
      });

      toast.success(t('profile.notifications.profileUpdated'));
    } catch (error: any) {
      toast.error(t('profile.notifications.errorUpdate'), {
        description: error.message,
      });
    } finally {
      setUpdating(false);
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
      await authClient.updateUserEmail(email);

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
      await authClient.updateUserPassword(newPassword);

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
      // Upload to storage
      const avatarUrl = await authClient.uploadAvatar(croppedImage, user.id);

      // Update profile
      await updateProfile(user.id, { avatar: avatarUrl });

      toast.success(t('profile.notifications.avatarUpdated'));
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

  return (
    <div className="space-y-6">
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
                disabled={updating || email === user?.email}
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

      <AvatarCropDialog
        open={cropDialogOpen}
        onClose={() => setCropDialogOpen(false)}
        imageSrc={imageSrc}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
