import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { StepProps } from "@/app/(auth)/sign-up";
import { findUsername } from "@/api/user/find-username";
import Toast from "react-native-toast-message";

export default function UsernameStep({
  control,
  onNext = () => {}
}: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { trigger, getValues, setError} = useFormContext()

  async function handleNextStep() {
    const isValid = await trigger(['username']);
    if (!isValid) return;

    const { username} = getValues();

    try {
      setIsLoading(true);
        const res = await findUsername(username);
        if(res.status) {
          setError("username", {
            type: "manual",
            message: "Esse nome de usuário está cadastrado",
          });
          return
        }
        onNext();
    } catch (error) {
      console.log('error on search username', error)

      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Erro cadastrar", "Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Controller
        control={control}
        name="username"
        render={({ fieldState, field: { onChange, onBlur, value } }) => (
          <FormField
            title="Nome de usuário"
            placeholder="Digite seu usuário"
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
