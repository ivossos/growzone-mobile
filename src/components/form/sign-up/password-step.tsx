import React from "react";
import { Controller } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { Lock } from "lucide-react-native";
import { StepProps } from "@/app/(auth)/sign-up";

export default function PasswordStep({
  control,
  onNext
}: StepProps) {
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
        handlePress={onNext}
        containerStyles="w-full mt-6"
        title="Continuar"
      />
    </>
  );
}
