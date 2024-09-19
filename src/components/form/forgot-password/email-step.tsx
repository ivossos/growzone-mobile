import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/forgot-password';
import Toast from 'react-native-toast-message';
import { recoverPassword } from '@/api/auth/recover-password';

export default function EmailStep({ control, onNext = () => {} }: StepProps) {
  const { trigger, getValues } = useFormContext()
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState<number>(60);

  async function handleNextStep() {
    const isValid = await trigger('email');
    if (!isValid) return;

    const { email } = getValues();

    try {
      setIsLoading(true);
      await recoverPassword(email);
      onNext();
    } catch (error) {
      console.log('erro send email')

      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Ocorreu um erro ao enviar código, tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ fieldState, field: { onChange, onBlur, value} }) => (
          <FormField
            title="E-mail"
            placeholder="Digite seu email"
            otherStyles="mt-6"
            keyboardType="email-address"
            onBlur={onBlur}
            value={value || ''}
            handleChangeText={onChange}
            error={fieldState.error?.message}
          />
        )}
      />

        <Button
          handlePress={handleNextStep}
          containerStyles="w-full mt-6"
          title="Continuar"
          isLoading={isLoading}
        />
      
    </>
  );
}