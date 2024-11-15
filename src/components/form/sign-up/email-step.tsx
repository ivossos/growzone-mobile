import React, { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { FormField } from '@/components/ui/form-field';
import Button from '@/components/ui/button';
import { StepProps } from '@/app/(auth)/sign-up';
import Toast from 'react-native-toast-message';
import { findEmail } from '@/api/user/find-email';
import { Text, View } from 'react-native';

export default function EmailStep({ control, onNext = () => {} }: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { trigger, getValues, setError} = useFormContext()

  async function handleNextStep() {
    const isValid = await trigger(['email']);
    if (!isValid) return;

    const { email } = getValues();

    try {
      setIsLoading(true);
      const res = await findEmail(email);
      if(res.status) {
        setError("email", {
          type: "manual",
          message: "Esse e-mail já está cadastrado",
        });
        return
      }
      onNext();
    } catch (error) {
      console.log('error on search email', error)

      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Erro cadastrar", "Tente novamente mais tarde.'
      });
      return;
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <>
      <View className="flex gap-2 pt-2 mb-2">
        <Text className="text-3xl font-semibold text-white text-center">
          Qual é seu e-mail ?
        </Text>
        <Text className="text-lg font-regular text-black-30 text-center ">
          Pedimos seu e-mail para facilitar o acesso na Growzone.
        </Text>
      </View>
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
            value={value}
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