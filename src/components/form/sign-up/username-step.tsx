import React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { StepProps } from "@/app/(auth)/sign-up";

export default function UsernameStep({
  control,
  onNext = () => {},
}: StepProps) {
  const {
    formState: { errors },
  } = useFormContext();

  console.log("errors", errors);
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
        handlePress={onNext}
        containerStyles="w-full mt-6"
        title="Continuar"
      />
    </>
  );
}
