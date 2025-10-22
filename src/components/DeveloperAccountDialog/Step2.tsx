import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, Check } from 'lucide-react';
import { COUNTRY_CODES } from '@/constants/phone';

interface Step2Props {
  formData: {
    phone_country: string;
    phone_number: string;
    phone_display: string;
  };
  setFormData: (data: any) => void;
  phoneVerified: boolean;
  onTelegramVerify: () => void;
}

export default function Step2({
  formData,
  setFormData,
  phoneVerified,
  onTelegramVerify,
}: Step2Props) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Подтверждение телефона</h3>
        <p className="text-sm text-muted-foreground">
          Для завершения регистрации необходимо подтвердить номер телефона через
          Telegram
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label>
          Телефон <span className="text-destructive">*</span>
        </Label>
        <div className="flex gap-2">
          <Select
            value={formData.phone_country || '+7'}
            onValueChange={(value) =>
              setFormData({ ...formData, phone_country: value })
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  <span className="flex items-center gap-2">
                    <span>{country.flag}</span>
                    <span>{country.code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="tel"
              value={formData.phone_display || ''}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/\D/g, '');
                const formatted = cleaned.replace(
                  /(\d{3})(\d{3})(\d{2})(\d{2})/,
                  '$1 $2 $3 $4'
                );
                setFormData({
                  ...formData,
                  phone_number: cleaned,
                  phone_display: formatted,
                });
              }}
              placeholder="999 123 45 67"
              className="pl-10"
              required
            />
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="text-center">
        {phoneVerified ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Check className="w-5 h-5" />
            <span className="font-medium">Номер подтвержден</span>
          </div>
        ) : (
          <div className="space-y-3">
            <Button
              type="button"
              onClick={onTelegramVerify}
              disabled={!formData.phone_number}
              className="w-full bg-[#229ED9] hover:bg-[#1f8fc4] text-white"
            >
              <span className="inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M9.04 12.87l-.38 5.36c.54 0 .78-.23 1.06-.5l2.55-2.44 5.29 3.88c.97.54 1.66.26 1.92-.9l3.49-16.37h.01c.31-1.46-.53-2.03-1.49-1.67L1.25 8.62c-1.43.56-1.41 1.36-.24 1.72l5.28 1.64L19.49 6c.61-.37 1.17-.17.71.2"
                  />
                </svg>
                Подтвердить через Telegram
              </span>
            </Button>
            <p className="text-xs text-muted-foreground">
              Мы откроем Telegram-бота и отправим ваш номер для подтверждения.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
