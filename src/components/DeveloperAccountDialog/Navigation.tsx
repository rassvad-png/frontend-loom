import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface NavigationProps {
  currentStep: number;
  onPrevStep: () => void;
  onNextStep: () => void;
  onStepClick: (step: number) => void;
  canGoToStep: (step: number) => boolean;
  validateStep1: () => boolean;
  phoneVerified: boolean;
  submitting: boolean;
  slugChecking: boolean;
  slugAvailable: boolean | null;
  orgNameError: string;
}

export default function Navigation({
  currentStep,
  onPrevStep,
  onNextStep,
  onStepClick,
  canGoToStep,
  validateStep1,
  phoneVerified,
  submitting,
  slugChecking,
  slugAvailable,
  orgNameError,
}: NavigationProps) {
  return (
    <div className="flex gap-3 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevStep}
        disabled={currentStep === 1}
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Назад
      </Button>

      <div className="flex-1 flex gap-2">
        {[1, 2, 3].map((step) => (
          <Button
            key={step}
            type="button"
            variant={currentStep === step ? 'default' : 'outline'}
            size="sm"
            onClick={() => canGoToStep(step) && onStepClick(step)}
            disabled={!canGoToStep(step)}
            className="flex-1"
          >
            {step}
          </Button>
        ))}
      </div>

      {currentStep < 3 ? (
        <Button
          type="button"
          onClick={onNextStep}
          disabled={
            (currentStep === 1 && !validateStep1()) ||
            (currentStep === 2 && !phoneVerified)
          }
          className="flex items-center gap-2 w-40"
        >
          Далее
          <ChevronRight className="w-4 h-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={
            submitting ||
            slugChecking ||
            slugAvailable === false ||
            !!orgNameError ||
            !phoneVerified
          }
          className="flex items-center gap-2 w-40"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Отправка...
            </>
          ) : (
            'Отправить заявку'
          )}
        </Button>
      )}
    </div>
  );
}
