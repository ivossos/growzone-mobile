import React, { useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { StepProps } from "@/app/(auth)/forgot-password";
import OtpInput from "@/components/ui/input-otp";
import { Text, TouchableOpacity, View } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { verifyCode } from "@/api/auth/verify-code";
import Toast from "react-native-toast-message";
import { resendEmailCode } from "@/api/user/resend-email-code";
import { recoverPassword } from "@/api/auth/recover-password";

export default function CodeStep({ control, onNext = () => {} }: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState<number>(60);
  const { trigger, getValues, setValue } = useFormContext();

  async function handleNextStep() {
    const isValid = await trigger("code");
    if (!isValid) return;

    const { email, code } = getValues();

    try {
      setIsLoading(true);
      const { reset_token } = await verifyCode(email, code);
      setValue("resetToken", reset_token);
      onNext();
    } catch (error) {
      console.log("erro on validate código");
      setValue("resetToken", "");

      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          "Ocorreu um erro ao validar seu código, tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCodeEmail() {
    if (isResendDisabled) return;

    try {
      const { email } = getValues();
      await recoverPassword(email);
      Toast.show({
        type: "success",
        text1: "Código enviado com sucesso",
        text2: "Verifique sua caixa de entrada ou seu spam.",
      });

      setIsResendDisabled(true);
      setTimer(60);

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Erro ao enviar código");
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Ocorreu um erro ao enviar código, tente novamente mais tarde.",
      });
    }
  }

  return (
    <View className="flex flex-col w-full">
      <Controller
        control={control}
        name="code"
        render={({ fieldState, field: { onChange, value } }) => (
          <OtpInput
            title="Código"
            onComplete={onChange}
            defaultValue={value}
            otpLength={6}
            errorMessage={fieldState.error?.message}
          />
        )}
      />

      <TouchableOpacity
        className="flex flex-row items-center gap-2 mt-2"
        onPress={() => resendCodeEmail()}
        disabled={isResendDisabled}
      >
        <RefreshCw
          width={16}
          height={16}
          color={isResendDisabled ? colors.black[70] : colors.brand.white}
        />
        <Text
          className={`text-lg font-medium ${
            isResendDisabled ? "text-black-70" : "text-brand-grey"
          }`}
        >
          {isResendDisabled
            ? `Reenviar código em ${timer}s`
            : "Reenviar código"}
        </Text>
      </TouchableOpacity>

      <Button
        handlePress={handleNextStep}
        containerStyles="w-full mt-6"
        title="Continuar"
        isLoading={isLoading}
      />
    </View>
  );
}
