import React, { useState } from 'react';
import RegistrationStep1 from './RegistrationStep1';
import RegistrationStep2 from './RegistrationStep2';
import RegistrationStep3 from './RegistrationStep3';
import ProgressIndicator from '../../components/common/ProgressIndicator';

export default function RegistrationScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    nic: '', email: '', phone: '', password: '',
    termsAccepted: false, language: 'en'
  });

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  return (
    <>
      <ProgressIndicator step={step} total={3} />
      {step === 1 && (
        <RegistrationStep1 form={form} setForm={setForm} nextStep={nextStep} />
      )}
      {step === 2 && (
        <RegistrationStep2 form={form} setForm={setForm} nextStep={nextStep} prevStep={prevStep} />
      )}
      {step === 3 && (
        <RegistrationStep3 form={form} setForm={setForm} prevStep={prevStep} navigation={navigation} />
      )}
    </>
  );
}