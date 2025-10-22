import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Globe, Github } from 'lucide-react';

interface Step3Props {
  formData: {
    website: string;
    contact_email: string;
    github_url: string;
  };
  setFormData: (data: any) => void;
}

export default function Step3({ formData, setFormData }: Step3Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">
          Дополнительная информация
        </h3>
        <p className="text-sm text-muted-foreground">
          Эти поля не обязательны, но помогут нам лучше понять вашу компанию
        </p>
      </div>

      {/* Website */}
      <div className="space-y-2">
        <Label htmlFor="website">{t('developer.form.website')}</Label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            placeholder={t('developer.form.websitePlaceholder')}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contact Email */}
      <div className="space-y-2">
        <Label htmlFor="contact_email">
          {t('developer.form.contactEmail')}
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) =>
              setFormData({ ...formData, contact_email: e.target.value })
            }
            placeholder={t('developer.form.contactEmailPlaceholder')}
            className="pl-10"
          />
        </div>
      </div>

      {/* GitHub URL */}
      <div className="space-y-2">
        <Label htmlFor="github_url">{t('developer.form.githubUrl')}</Label>
        <div className="relative">
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="github_url"
            type="url"
            value={formData.github_url}
            onChange={(e) =>
              setFormData({ ...formData, github_url: e.target.value })
            }
            placeholder={t('developer.form.githubUrlPlaceholder')}
            className="pl-10"
          />
        </div>
      </div>
    </div>
  );
}
