import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { DevAccountFormDataAtom, DevAccountFormStepAtom, PhoneVerifiedAtom } from '../atoms';

// Developer account form hooks
export const useDevAccountFormData = () => useAtom(DevAccountFormDataAtom);
export const useSetDevAccountFormData = () => useSetAtom(DevAccountFormDataAtom);
export const useDevAccountFormDataValue = () => useAtomValue(DevAccountFormDataAtom);

export const useDevAccountFormStep = () => useAtom(DevAccountFormStepAtom);
export const useSetDevAccountFormStep = () => useSetAtom(DevAccountFormStepAtom);
export const useDevAccountFormStepValue = () => useAtomValue(DevAccountFormStepAtom);

export const usePhoneVerified = () => useAtom(PhoneVerifiedAtom);
export const useSetPhoneVerified = () => useSetAtom(PhoneVerifiedAtom);
export const usePhoneVerifiedValue = () => useAtomValue(PhoneVerifiedAtom);
