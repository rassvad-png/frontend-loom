import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Building, FileText, MapPin, Check, Loader2 } from 'lucide-react';

interface Step1Props {
  formData: {
    org_name: string;
    tax_identifier: string;
    legal_address: string;
    type: 'official' | 'individual';
  };
  setFormData: (data: any) => void;
  slug: string;
  slugChecking: boolean;
  slugAvailable: boolean | null;
  orgNameError: string;
  onOrgNameChange: (value: string) => void;
}

export default function Step1({
  formData,
  setFormData,
  slug,
  slugChecking,
  slugAvailable,
  orgNameError,
  onOrgNameChange,
}: Step1Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Account Type */}
      <div className="space-y-2">
        <Label>Тип аккаунта</Label>
        <Tabs
          value={formData.type}
          onValueChange={(v) =>
            setFormData({ ...formData, type: v as 'official' | 'individual' })
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="official">Оффициальный</TabsTrigger>
            <TabsTrigger value="individual">Индивидуальный</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="org_name">
          {t('developer.form.orgName')}{' '}
          <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="org_name"
            value={formData.org_name}
            onChange={(e) => onOrgNameChange(e.target.value)}
            placeholder={t('developer.form.orgNamePlaceholder')}
            className={`pl-10 ${orgNameError ? 'border-red-500' : ''}`}
            required
          />
        </div>
        {/* Reserved space for error message */}
        <div className="h-1">
          {orgNameError && (
            <p className="text-sm text-red-500">{orgNameError}</p>
          )}
        </div>
      </div>

      {/* Slug Display - Always reserved space */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">URL slug</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-3 py-2 bg-muted rounded-md text-sm text-muted-foreground min-h-[40px] flex items-center">
            {slug || (
              <span className="text-muted-foreground/50">
                Будет сгенерирован автоматически
              </span>
            )}
          </div>
          <div className="w-6 h-6 flex items-center justify-center">
            {slugChecking ? (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            ) : slugAvailable === true ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : slugAvailable === false ? (
              <span className="text-red-500 text-sm">Занят</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Tax Identifier (INN) */}
      {formData.type === 'official' && (
        <div className="space-y-2">
          <Label htmlFor="tax_identifier">
            {t('developer.form.taxIdentifier')}{' '}
            <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="tax_identifier"
              value={formData.tax_identifier}
              onChange={(e) =>
                setFormData({ ...formData, tax_identifier: e.target.value })
              }
              placeholder={t('developer.form.taxIdentifierPlaceholder')}
              className="pl-10"
              required
            />
          </div>
        </div>
      )}

      {/* Legal Address */}
      {formData.type === 'official' && (
        <div className="space-y-2">
          <Label htmlFor="legal_address">
            {t('developer.form.legalAddress')}
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Textarea
              id="legal_address"
              value={formData.legal_address}
              onChange={(e) =>
                setFormData({ ...formData, legal_address: e.target.value })
              }
              placeholder={t('developer.form.legalAddressPlaceholder')}
              className="pl-10 min-h-[80px]"
            />
          </div>
        </div>
      )}
    </div>
  );
}
