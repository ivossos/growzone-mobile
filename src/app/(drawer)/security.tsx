import { updateUser } from "@/api/social/profile/update-user";
import Button from "@/components/ui/button";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "expo-router";
import { ArrowLeft, Lock } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";

const PasswordValidation = z
  .object({
    password: z
      .string()
      .min(6, "Senha fraca demais")
      .max(30, "Máximo é 30 caracteres")
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$!%&*])[A-Za-z\d@#$!%&*]+$/,
        {
          message:
            "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
        }
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas estão diferentes",
    path: ["confirmPassword"],
  });

export default function Security() {
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const form = useForm({
    resolver: zodResolver(PasswordValidation),
    values: {
      password: "",
      confirmPassword: ""
    },
  });

  async function submit(values: z.infer<typeof PasswordValidation>) {
    try {
      setIsLoading(true);
      await updateUser({
        password: values.password,
      });

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Sua senha foi atualizado com sucesso.",
      });
    } catch (err) {
      console.log("erro on update register", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Ocorreu um erro ao atualizar sua cadastro, tente novamente",
      });
      return;
    } finally {
      setIsLoading(false);
    }
  }

  const { title, description, Icon } = screens["security"];
  return (
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">{title}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex flex-col gap-6 py-6 px-6 pb-24">
            <ConfigHeader title={title} description={description} Icon={Icon} />

            <Controller
              control={form.control}
              name="password"
              render={({ fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Nova senha"
                  placeholder="•••••••••"
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
              control={form.control}
              name="confirmPassword"
              render={({ fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Confirmar nova senha"
                  placeholder="•••••••••"
                  leftIcon={Lock}
                  type="password"
                  onBlur={onBlur}
                  value={value}
                  handleChangeText={onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Button
              containerStyles="w-full"
              title="Salvar alterações"
              handlePress={form.handleSubmit(submit)}
              isLoading={isLoading}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
