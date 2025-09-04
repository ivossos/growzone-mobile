import { useEffect, useState } from "react";
import { View, Text, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";

import LogoIcon from "@/assets/icons/logo.svg";
import { setAppleUsername } from "@/api/auth/apple-login";
import { showSuccess, showError } from "@/utils/toast";

import Button from "@/components/ui/button";
import { colors } from "@/styles/colors";
import { useAuth } from "@/hooks/use-auth";
import { Checkbox } from '@/components/Checkbox';

const SetUsername = () => {
  const [isAccepted, setIsAccepted] = useState(false);
  const [isError, setIsError] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user, updateUserData } = useAuth();

  const handleSetUsername = async () => {

    setIsError(false);

    if (user?.has_username) {
      router.replace("/home");
      return;
    }

    if (!isAccepted) {
      setIsError(true);
      return;
    }

    if (!username.trim()) {
      showError("Username is required");
      return;
    }

    if (username.length < 3) {
      showError("O nome de usuário deve ter pelo menos 3 caracteres");
      return;
    }

    if (username.length > 20) {
      showError("O nome de usuário deve ter menos de 20 caracteres");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      showError("O nome de usuário só pode conter letras, números e underscores");
      return;
    }

    try {

      await updateUserData()

      setIsLoading(true);
      await setAppleUsername({ username: username.trim() });
      showSuccess("Nome de usuário definido com sucesso!");

      await updateUserData()

      router.replace("/home");
    } catch (error: any) {
      const message = error?.message || "Falha ao definir o nome de usuário. Tente novamente.";
      if (message === "Username already exists") {
        showError("Este nome de usuário já está em uso. Por favor, escolha outro.");
      } else if (message === "Usuário já possui username definido") {
        showError(message);
        router.push('/home');
      } else {
        showError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="bg-black-100 w-full flex items-center justify-center h-full px-6 pt-20">
      <View className="flex-1 bg-black-100">
        <SafeAreaView edges={["top"]} className="flex-1">


          <View className="flex flex-row justify-center items-center pt-10">
            <LogoIcon width={150} height={30} />
          </View>
          <View className="flex items-center justify-center gap-6 my-10">
            <Text className="text-2xl font-semibold text-white text-center">
              Escolha o seu nome de usuário
            </Text>
            <Text className="text-lg font-regular text-black-30 text-center">
              Este será seu identificador único na comunidade GrowZone
            </Text>
          </View>

          <View className="w-full gap-4">
            <View className="gap-2">
              <Text className="text-white text-lg font-medium">Usuário</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Digite seu nome de usuário"
                placeholderTextColor={colors.black["30"]}
                className="bg-black-90 rounded-lg min-h-[56px] px-4 text-white text-lg"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                maxLength={20}
              />
            </View>

            <View className="gap-2">
              <Text className="text-black-30 text-sm">
                • 3-20 caracteres
              </Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-2 mt-2 w-full">
            <Checkbox
              labelClasses="text-base font-medium text-black-30"
              checkboxClasses={`${isError && !isAccepted && "border-red-500"}`}
              isChecked={isAccepted}
              toggleCheckbox={() => setIsAccepted((prevState) => !prevState)}
            />
            <Text className="text-lg font-regular text-black-30 flex-1 flex-wrap">
              Ao se cadastrar você concorda com os nossos{" "}
              <Text
                className="text-brand-green"
                onPress={() => router.push("/terms")}
              >
                termos de uso, políticas de privacidade, uso de dados e normas da
                comunidade
              </Text>
              .
            </Text>
          </View>

          {isError && !isAccepted && (
            <View className="flex flex-row items-start mt-2 w-full">
              <Text className="text-start text-red-500 text-base font-medium">
                Você precisa aceitar os termos para continuar
              </Text>
            </View>
          )}

          <View className="w-full mt-8">
            <Button
              variant="default"
              handlePress={handleSetUsername}
              title="Continue"
              rightIcon={ArrowRight}
              isDisabled={isLoading || !username.trim()}
              isLoading={isLoading}
            />
          </View>
        </SafeAreaView>
      </View >
    </View >
  );
};

export default SetUsername; 