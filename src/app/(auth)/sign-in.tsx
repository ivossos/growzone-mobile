import { z } from "zod";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Image, TouchableOpacity } from "react-native";
import images from "@/constants/images";
import Toast from 'react-native-toast-message';

import Button from "@/components/ui/button";
import { ArrowRight, AtSign, Lock } from "lucide-react-native";
import Divider from "@/components/ui/divider";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/Checkbox";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { storageGetLogin, storageRemoveLogin, storageSaveLogin } from "@/storage/storage-login";
import { StatusBar } from "expo-status-bar";

export const SigninValidation = z.object({
  username: z.string(),
  password: z.string()
    .min(6, "Senha fraca demais")
    .max(30, "Máximo é 30 caracteres"),
})


const SignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn, user } = useAuth();

  const form = useForm({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  async function submit(values: z.infer<typeof SigninValidation>) {
    let userLogged;
    try {
      setIsLoading(true);
      handleRememberMe(
        values.username,
        values.password
      );
      userLogged = await signIn(
        values.username,
        values.password
      );

    } catch (err) {
      console.log('error login', err)

      if (err === 'Inactive user') {
        Toast.show({
          type: 'error',
          text1: 'Opss',
          text2: 'Seu usuário foi desativado por infringir as regras da plataforma.'
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Opss',
          text2: 'Seu usuario ou senha estão incorretos 👋'
        });
      }

      return;
    } finally {
      setIsLoading(false);
    }

    if (!userLogged.is_verified) {
      return router.replace("/verify-user");
    }

    router.replace("/home");
  };

  async function handleRememberMe(username: string, password: string) {
    try {
      if (rememberMe) {
        await storageSaveLogin({ username, password, remember: true });

      } else {
        await storageRemoveLogin()
      }
    } catch (e) {
      console.error('Erro ao salvar os dados no AsyncStorage', e);
    }
  };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const loginData = await storageGetLogin();
        if (loginData) {
          const { username, password, remember } = loginData;
          form.setValue('username', username);
          form.setValue('password', password);
          setRememberMe(remember);
        }
      } catch (e) {
        console.error('Erro ao carregar os dados do AsyncStorage', e);
      }
    };

    loadStoredData();
  }, []);


  return (
    <>
      <SafeAreaView className="bg-black-100 h-full" edges={['top']}>
        <ScrollView className="bg-black-100 pb-10">
          <View
            className="w-full flex items-center h-full px-6"
            style={{
              minHeight: Dimensions.get("window").height - 100,
            }}
          >
            <View className="flex items-center justify-center gap-6 my-8">
              <Image source={images.logoGreen} className='w-[250px] h-10' resizeMode='contain' />

              <View className="flex gap-2">
                <Text className="text-3xl font-semibold text-white text-center">
                  Seja bem-vindo ao Growzone!
                </Text>

                <Text className="text-lg font-regular text-black-30 text-center mt-">
                  Já é um membro? Digite seu e-mail e senha para conectar-se com a comunidade
                </Text>
              </View>
            </View>
            <Controller
              control={form.control}
              name="username"
              render={({ fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Nome de usuário"
                  placeholder="Digite seu nome de usuário"
                  otherStyles="mt-5 w-full"
                  leftIcon={AtSign}
                  onBlur={onBlur}
                  value={value}
                  handleChangeText={onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Password"
                  type="password"
                  placeholder="•••••••••"
                  otherStyles="mt-6 w-full"
                  leftIcon={Lock}
                  onBlur={onBlur}
                  value={value}
                  handleChangeText={onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <View className="flex flex-row justify-between mt-2 w-full">
              <Checkbox
                label="Lembrar-me"
                labelClasses="text-lg font-medium text-black-30"
                isChecked={rememberMe}
                toggleCheckbox={() => setRememberMe((prevState) => !prevState)}
              />

              <TouchableOpacity
                className='flex flex-row items-center gap-2 mt-2'
                onPress={() => router.push('/forgot-password')}>
                <Text className="text-lg font-regular text-black-30">Esqueceu sua senha?</Text>
              </TouchableOpacity>
            </View>

            <Button
              variant="outline"
              handlePress={form.handleSubmit(submit)}
              containerStyles="w-full mt-6"
              title='Conectar-se'
              isLoading={isLoading}
            />

            <Divider text="Ou" className="!my-4" />

            <View className="flex flex-col justify-center w-full gap-2">
              <Text className="text-center text-lg text-gray-100 font-medium">
                Ainda não possui uma conta?
              </Text>
              <Button
                handlePress={() => router.push("/welcome")}
                containerStyles="mt-4"
                title='Crie agora'
                rightIcon={ArrowRight}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar backgroundColor="#000000" style="light" />
    </>
  );
};

export default SignIn;