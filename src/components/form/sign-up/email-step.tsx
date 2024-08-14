import React from 'react';
import { Controller } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/sign-up';

export default function EmailStep({ control, onNext = () => {} }: StepProps) {


  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ fieldState, field: { onChange, onBlur, value} }) => (
          <FormField
            title="Email"
            placeholder="Digite seu email"
            otherStyles="mt-6"
            keyboardType="email-address"
            onBlur={onBlur}
            value={value}
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