import { z } from "zod";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Image, TouchableOpacity, Platform } from "react-native";
import images from "@/constants/images";
import Toast from 'react-native-toast-message';

import Button from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { Fragment, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";
import OtpInput from "@/components/ui/input-otp";
import axios from "axios";
import { verifyCode } from "@/api/user";
import { resendEmailCode } from "@/api/user/resend-email-code";
import { FormField } from "@/components/ui/form-field";

const codeSchema = z
  .object({
    code: z.string().min(6, "Digite o código de 6 dígitos"),
  });

type CodeSchema = z.infer<typeof codeSchema>;

const VerifyUser = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [timer, setTimer] = useState<number>(60);
  const { user, signOut, updateUserData} = useAuth();

  const methods = useForm<CodeSchema>({
    resolver: zodResolver(codeSchema),
    mode: "all",
    defaultValues: {
      code: "",
    },
  });

  async function resendCodeEmail(email: string) {
    if (isResendDisabled) return;

    try {
      await resendEmailCode({ email: email });
      Toast.show({
        type: 'success',
        text1: 'Código enviado com sucesso',
        text2: 'Verifique sua caixa de entrada ou seu spam.'
      });

      setIsResendDisabled(true);
      setTimer(60);

      const interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Erro ao enviar código');
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Ocorreu um erro ao enviar código, tente novamente mais tarde.'
      });
    }
  }

  async function submit(values: CodeSchema) {
    try {
      setIsLoading(true)
      const { code } = values;
      await verifyCode({
        email: user.email, code
      });
      await updateUserData()

    } catch (error) {
      if (axios.isAxiosError(error)) {
        methods.setError("code", {
          type: "manual",
          message: "O código de verificação está incorreto. Por favor, tente novamente.",
        });
      }
      return;
    } finally {
      setIsLoading(false);
    }

    router.replace("/home");
  };

  async function goBack() {
    await signOut();
    router.replace("/welcome")
  }

  return (
    <Fragment>
      <SafeAreaView className="bg-black-100 h-full">
        <TouchableOpacity 
          className="flex flex-row items-center justify-between bg-black-100 w-full px-6 min-h-14 border-b-[1px] border-black-80"
          activeOpacity={0.7} 
          onPress={goBack}>
          <ArrowLeft width={24} height={24} color={colors.brand.white} />
        </TouchableOpacity>
        <ScrollView className="bg-black-100 pb-10">
          <View
            className="w-full flex items-center h-full px-6"
            style={{
              minHeight: Dimensions.get("window").height - 100,
            }}
          >
            <View className="flex items-center justify-center gap-6 my-10">
              <Image
                source={images.logoGreen}
                className="w-[250px] h-10"
                resizeMode="contain"
              />

              <View className="flex gap-2">
                <Text className="text-4xl font-semibold text-white text-center">
                  Digite o código de verificação
                </Text>

                <View>
                  <Text className="text-lg font-regular text-black-30 text-center ">
                    Digite o código que você recebeu via email.
                  </Text>
                  <Text className="text-lg font-regular text-black-30 text-center ">
                    Esse código expira em 10 minutos.
                  </Text>
                </View>
              </View>
            </View>

            <View className='flex flex-col w-full'>
            {Platform.OS === 'ios' ?  <Controller
                control={methods.control}
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
              control={methods.control}
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
                className='flex flex-row items-center gap-2 mt-2'
                onPress={() => resendCodeEmail(user.email)}
                disabled={isResendDisabled}
              >
                <RefreshCw width={16} height={16} color={isResendDisabled ? colors.black[70] : colors.brand.white} />
                <Text className={`text-lg font-medium ${isResendDisabled ? 'text-black-70' : 'text-brand-grey'}`}>
                  {isResendDisabled ? `Reenviar código em ${timer}s` : 'Reenviar código'}
                </Text>
              </TouchableOpacity>

              <Button
                handlePress={methods.handleSubmit(submit)}
                containerStyles="w-full mt-6"
                title="Continuar"
                isLoading={isLoading}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar backgroundColor="#000000" style="light" />
    </Fragment>
  );
};

export default VerifyUser;
