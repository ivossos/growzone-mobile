import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { StepProps } from "@/app/(auth)/sign-up";
import OtpInput from "@/components/ui/input-otp";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import { RefreshCw } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { verifyCode } from "@/api/user";
import axios from "axios";
import Toast from "react-native-toast-message";
import { resendEmailCode } from "@/api/user/resend-email-code";

export default function CodeStep({ control, onSubmit = () => {} }: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState<number>(60);
  const { trigger, getValues, setError } = useFormContext();

  async function handleNextStep() {
    const isValid = await trigger("code");
    if (!isValid) return;

    try {
      setIsLoading(true);
      const { code, email } = getValues();
      await verifyCode({ email, code: code });
      onSubmit();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError("code", {
          type: "manual",
          message:
            "O código de verificação está incorreto. Por favor, tente novamente.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Opss",
          text2:
            "Ocorreu um erro ao validar seu código, tente novamente mais tarde.",
        });

      }
    } finally {
      setIsLoading(false);
    }
  }

  async function resendCodeEmail() {
    if (isResendDisabled) return;
    
    const { email } = getValues();

    try {
      await resendEmailCode({email});
      Toast.show({
        type: "success",
        text1: "Código reenviado com sucesso",
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
    <>
      <View className="flex gap-2 pt-6 mb-4">
        <Text className="text-4xl font-semibold text-white text-center">
          Digite o código de verificação
        </Text>

        <Text className="text-lg font-regular text-black-30 text-center ">
          Digite o código que você recebeu via email ou celular.
        </Text>
      </View>
      <View className="flex flex-col w-full">
        {Platform.OS === 'ios' ?  
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

        :

        <Controller
          control={control}
          name="code"
          render={({ fieldState, field: { onChange, onBlur, value} }) => (
            <FormField
              title="Código"
              placeholder="Digite seu código"
              otherStyles="mt-6"
              onBlur={onBlur}
              value={value || ''}
              keyboardType="decimal-pad"
              handleChangeText={onChange}
              error={fieldState.error?.message}
            />
          )}
        />}

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
    </>
  );
}
