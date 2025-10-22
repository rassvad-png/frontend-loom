import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { ResponsiveDrawer } from '@/components/ui/responsive-drawer';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Navigation from './Navigation';

const SLUG_CHECK_DELAY = 500;
const SLUG_REGEX = /[^a-z0-9-]/g;
const LATIN_REGEX = /^[a-zA-Z\s\-&.,()]+$/;
const FORM_STORAGE_KEY = 'dev_account_form';
const STEP_STORAGE_KEY = 'dev_account_step';

interface DeveloperAccountDialogProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export default function DeveloperAccountDialog({
  open,
  onClose,
  userId,
}: DeveloperAccountDialogProps) {
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [slug, setSlug] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [orgNameError, setOrgNameError] = useState<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [formData, setFormData] = useState({
    org_name: '',
    tax_identifier: '',
    website: '',
    contact_email: '',
    github_url: '',
    legal_address: '',
    type: 'official' as 'official' | 'individual',
    phone_country: '+7',
    phone_number: '',
    phone_display: '',
  });

  // Load saved form and step from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(FORM_STORAGE_KEY);
      const savedStep = localStorage.getItem(STEP_STORAGE_KEY);

      if (raw) {
        const saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          setFormData((prev) => ({
            ...prev,
            ...saved,
          }));
          if (saved.org_name) {
            setSlug(generateSlug(String(saved.org_name)));
          }
        }
      }

      if (savedStep) {
        const step = parseInt(savedStep, 10);
        if (step >= 1 && step <= 3) {
          setCurrentStep(step);
        }
      }

      // Check phone verification status
      const phoneStatus = localStorage.getItem('phone_verified');
      setPhoneVerified(phoneStatus === 'true');
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist form and step to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
      localStorage.setItem(STEP_STORAGE_KEY, currentStep.toString());
    } catch {}
  }, [formData, currentStep]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Generate slug from organization name
  const generateSlug = (orgName: string) => {
    return orgName.toLowerCase().replace(/\s+/g, '').replace(SLUG_REGEX, '');
  };

  // Check if slug is available in database
  const checkSlugAvailability = async (slugToCheck: string) => {
    if (!slugToCheck) return;

    setSlugChecking(true);
    try {
      const { data, error } = await supabase
        .from('dev_accounts')
        .select('id')
        .eq('slug', slugToCheck)
        .maybeSingle();

      if (error) throw error;

      setSlugAvailable(!data); // true if no data found (available)
    } catch (error: any) {
      console.error('Error checking slug:', error);
      setSlugAvailable(false);
    } finally {
      setSlugChecking(false);
    }
  };

  // Handle organization name change with debounce
  const handleOrgNameChange = (value: string) => {
    setFormData({ ...formData, org_name: value });

    // Validate latin characters
    if (value && !LATIN_REGEX.test(value)) {
      setOrgNameError(
        'Название компании должно содержать только латинские буквы'
      );
    } else {
      setOrgNameError('');
    }

    const newSlug = generateSlug(value);
    setSlug(newSlug);
    setSlugAvailable(null); // Reset availability status
    setSlugChecking(true); // Start checking immediately

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced check
    if (newSlug && !orgNameError) {
      debounceRef.current = setTimeout(() => {
        checkSlugAvailability(newSlug);
      }, SLUG_CHECK_DELAY);
    } else {
      setSlugChecking(false);
    }
  };

  // Step navigation functions
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canGoToStep = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return validateStep1();
    if (step === 3) return validateStep1() && phoneVerified;
    return false;
  };

  const validateStep1 = () => {
    return (
      formData.org_name.trim() !== '' &&
      !orgNameError &&
      slugAvailable !== false &&
      (formData.type === 'individual' || formData.tax_identifier.trim() !== '')
    );
  };

  // Handle phone verification
  const handlePhoneVerification = () => {
    setPhoneVerified(true);
    localStorage.setItem('phone_verified', 'true');
  };

  // Mock verification for demo - replace with real verification
  const mockPhoneVerification = () => {
    setTimeout(() => {
      handlePhoneVerification();
    }, 2000);
  };

  // Open Telegram bot to verify phone number
  const handleTelegramVerify = () => {
    const fullPhone = formData.phone_country + formData.phone_number;
    const bot = 'zenhub_verifier_bot';
    const tgDeepLink = `tg://resolve?domain=${bot}&start=${encodeURIComponent(
      fullPhone
    )}`;
    const tgWebLink = `https://t.me/${bot}?start=${encodeURIComponent(
      fullPhone
    )}`;
    try {
      window.location.href = tgDeepLink;
      setTimeout(() => {
        window.open(tgWebLink, '_blank');
      }, 300);
    } catch {
      window.open(tgWebLink, '_blank');
    }

    // Mock verification for demo - remove in production
    mockPhoneVerification();
  };

  const validateForm = () => {
    if (!formData.org_name.trim()) {
      toast.error(t('developer.validation.orgNameRequired'));
      return false;
    }
    if (orgNameError) {
      toast.error(orgNameError);
      return false;
    }
    if (formData.type === 'official' && !formData.tax_identifier.trim()) {
      toast.error('ИНН обязателен для юридического лица');
      return false;
    }
    if (!formData.phone_number.trim()) {
      toast.error('Номер телефона обязателен для заполнения');
      return false;
    }
    if (!phoneVerified) {
      toast.error('Необходимо подтвердить номер телефона');
      return false;
    }
    if (
      formData.contact_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_email)
    ) {
      toast.error(t('developer.validation.invalidEmail'));
      return false;
    }
    if (slugAvailable === false) {
      toast.error('Название компании уже занято. Попробуйте другое название.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // Check if user already has a dev account
      const { data: existing } = await supabase
        .from('dev_accounts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existing) {
        toast.error(t('developer.validation.alreadyExists'));
        setSubmitting(false);
        return;
      }

      // Create new dev account
      await apiClient.createDevAccount({
        user_id: userId,
        org_name: formData.org_name,
        website: formData.website || '',
        contact_email: formData.contact_email || '',
        github_url: formData.github_url || '',
        legal_address: formData.type === 'official' ? formData.legal_address || '' : '',
        tax_identifier: formData.tax_identifier,
        phone: formData.phone_country + formData.phone_number || '',
        status: 'pending'
      });

      toast.success(t('developer.success'));
      onClose();
      // Reset form
      setFormData({
        org_name: '',
        tax_identifier: '',
        website: '',
        contact_email: '',
        github_url: '',
        legal_address: '',
        type: 'official',
        phone_country: '+7',
        phone_number: '',
        phone_display: '',
      });
      setSlug('');
      setSlugAvailable(null);
      setOrgNameError('');
      setCurrentStep(1);
      setPhoneVerified(false);
      try {
        localStorage.removeItem(FORM_STORAGE_KEY);
        localStorage.removeItem(STEP_STORAGE_KEY);
        localStorage.removeItem('phone_verified');
      } catch {}
    } catch (error: any) {
      toast.error(t('developer.error'), { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1
            formData={formData}
            setFormData={setFormData}
            slug={slug}
            slugChecking={slugChecking}
            slugAvailable={slugAvailable}
            orgNameError={orgNameError}
            onOrgNameChange={handleOrgNameChange}
          />
        );
      case 2:
        return (
          <Step2
            formData={formData}
            setFormData={setFormData}
            phoneVerified={phoneVerified}
            onTelegramVerify={handleTelegramVerify}
          />
        );
      case 3:
        return (
          <Step3
            formData={formData}
            setFormData={setFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveDrawer
      open={open}
      onOpenChange={onClose}
      title={t('developer.title')}
      description={t('developer.description')}
    >
      <form onSubmit={handleSubmit} className="h-[550px] flex flex-col">
        <div className="flex-1 overflow-auto space-y-4 p-1">
          {renderCurrentStep()}
        </div>
        <Navigation
          currentStep={currentStep}
          onPrevStep={prevStep}
          onNextStep={nextStep}
          onStepClick={setCurrentStep}
          canGoToStep={canGoToStep}
          validateStep1={validateStep1}
          phoneVerified={phoneVerified}
          submitting={submitting}
          slugChecking={slugChecking}
          slugAvailable={slugAvailable}
          orgNameError={orgNameError}
        />
      </form>
    </ResponsiveDrawer>
  );
}