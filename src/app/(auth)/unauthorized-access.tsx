import { Redirect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image } from "react-native";
import images from "@/constants/images";
import { useAuth } from "@/hooks/use-auth";
import Loader from "@/components/ui/loader";
import { StatusBar } from "expo-status-bar";
import AnimatedError from "@/components/ui/animated-error";

const UnauthorizedAccess = () => {
  const { user, isLoadingUserStorage } = useAuth();

  if (user?.id && !isLoadingUserStorage) return <Redirect href="/home" />;

  return (
    <>
      <SafeAreaView className="bg-black-100 h-full" edges={["top"]}>
        <Loader isLoading={isLoadingUserStorage} />
        <View className="bg-black-100 w-full flex items-center justify-center h-full px-6">
          <View className="flex items-center justify-center gap-6 my-10">
            <AnimatedError />
            <View className="flex gap-2">
              <Text className="text-3xl font-semibold text-white text-center">
                Acesso não autorizado
              </Text>

              <Text className="text-lg font-regular text-black-30 text-center ">
                Infelizmente você não poderá acessar a plataforma. Agradecemos a
                compreensão.
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
};

export default UnauthorizedAccess;
