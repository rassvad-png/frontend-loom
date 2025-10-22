import { atomWithStorage } from 'jotai/utils';
import { DevAccountFormData } from '../types';

// Developer account form data with localStorage persistence
export const DevAccountFormDataAtom = atomWithStorage<DevAccountFormData>('dev_account_form', {
  orgName: '',
  website: '',
  contactEmail: '',
  githubUrl: '',
  legalAddress: '',
  taxIdentifier: '',
  phone: '',
}, undefined, {
  getOnInit: true,
});

// Developer account form step with localStorage persistence
export const DevAccountFormStepAtom = atomWithStorage<number>('dev_account_step', 1, undefined, {
  getOnInit: true,
});

// Phone verification status with localStorage persistence
export const PhoneVerifiedAtom = atomWithStorage<boolean>('phone_verified', false, undefined, {
  getOnInit: true,
});
