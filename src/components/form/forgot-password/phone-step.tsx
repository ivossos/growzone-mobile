import React from 'react';
import { Controller } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/forgot-password';

export default function PhoneStep({ control, onNext = () => {} }: StepProps) {
  return (
    <>
      <Controller
        control={control}
        name="phone"
        render={({ fieldState, field: { onChange, onBlur, value} }) => (
          <FormField
            title="Telefone"
            placeholder="Digite seu telefone"
            otherStyles="mt-6"
            onBlur={onBlur}
            value={value || ''}
            handleChangeText={onChange}
            error={fieldState.error?.message}
          />
        )}
      />

        <Button
          handlePress={onNext}
          containerStyles="w-full mt-6"
          title="Continuar"
        />
      
    </>
  );
}