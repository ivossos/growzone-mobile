import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { Lock } from "lucide-react-native";
import { StepProps } from "@/app/(auth)/forgot-password";
import { resetPassword } from "@/api/auth/reset-password";
import Toast from "react-native-toast-message";

export default function PasswordStep({
  control,
  onSubmit
}: StepProps) {
  const [isLoading, setIsLoading] = useState(false)

  const { trigger, getValues } = useFormContext()

  async function handleNextStep() {
    const isValid = await trigger(['password', 'confirmPassword']);
    if (!isValid) return;

    const { password, resetToken } = getValues();

    try {
      setIsLoading(true);
      await resetPassword(resetToken, password);
      onSubmit();
    } catch (error) {
      console.log('erro send email')

      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Ocorreu um erro ao enviar sua nova senha, tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Controller
        control={control}
        name="password"
        render={({  fieldState, field: { onChange, onBlur, value } }) => (
          <FormField
            title="Senha"
            placeholder="•••••••••"
            otherStyles="mt-6"
            type="password"
            leftIcon={Lock}
            onBlur={onBlur}
            value={value}
            handleChangeText={onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({  fieldState, field: { onChange, onBlur, value } }) => (
          <FormField
            title="Confirmar senha"
            placeholder="•••••••••"
            otherStyles="mt-6"
            type="password"
            leftIcon={Lock}
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
