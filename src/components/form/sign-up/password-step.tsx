import React, { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import { Lock } from "lucide-react-native";
import { StepProps } from "@/app/(auth)/sign-up";
import Toast from "react-native-toast-message";
import { createUser } from "@/api/user";
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Checkbox } from "@/components/Checkbox";
import { router } from "expo-router";

export default function PasswordStep({
  control,
  onNext
}: StepProps) {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { trigger, getValues } = useFormContext()

  async function handleNextStep() {
    setIsError(false);
    
    if(!isAccepted) {
      setIsError(true);
      return;
    }

    const isValid = await trigger(['password', 'confirmPassword']);
    if (!isValid) return;

    const { username, email, password } = getValues();

    try {
      setIsLoading(true);
      await createUser({ username, email, password });
      onNext();
    } catch (error) {
      console.log('error on create user', error)

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
        <View className="flex gap-2 pt-6 mb-4">
          <Text className="text-4xl font-semibold text-white text-center">
            Crie uma senha de acesso
          </Text>

          <Text className="text-lg font-regular text-black-30 text-center ">
            Escolha uma senha forte para proteger sua conta.
          </Text>
        </View>
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

        <View className="flex flex-row items-center gap-2 mt-2 w-full">
          <Checkbox 
            labelClasses="text-base font-medium text-black-30"
            checkboxClasses={`${(isError && !isAccepted) && 'border-red-500'}`}
            isChecked={isAccepted}
            toggleCheckbox={() => setIsAccepted((prevState) => !prevState)}
          />
          <Text className="text-lg font-regular text-black-30 flex-1 flex-wrap">
          Ao se cadastrar você concorda com os nossos{' '}
          <Text className="text-brand-green" onPress={() => router.push('/terms')}>
            termos de uso, políticas de privacidade, uso de dados e normas da comunidade
          </Text>
          .
        </Text>
        </View>
        {(isError && !isAccepted) &&
        <View className="flex flex-row items-start mt-2 w-full">
        <Text className="text-start text-red-500 text-base font-medium">Você precisa aceitar os termos para continuar</Text>

        </View>}

        <Button
          handlePress={handleNextStep}
          containerStyles="w-full mt-6"
          title="Continuar"
          isDisabled={isLoading}
          isLoading={isLoading}
        />
      </>
  );
}
