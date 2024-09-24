import React from 'react';
import { Controller } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/sign-up';
import { Text, View } from 'react-native';

export default function PhoneStep({ control, onNext = () => {} }: StepProps) {
  return (
    <>
      <View className="flex gap-2 pt-6 mb-4">
        <Text className="text-4xl font-semibold text-white text-center">
          Qual é seu celular ?
        </Text>
        <Text className="text-lg font-regular text-black-30 text-center ">
          Pedimos seu número para facilitar o acesso na Growzone.
        </Text>
      </View>
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