import { Redirect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, Image } from "react-native";
import images from "@/constants/images";

import Button from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import Loader from "@/components/ui/loader";
import { StatusBar } from "expo-status-bar";

const AgeDecision = () => {
  const { user, isLoadingUserStorage } = useAuth();
  
  if (user?.id && !isLoadingUserStorage) return <Redirect href="/home" />;

  return (
    <>
      <SafeAreaView className="bg-black-100 h-full" edges={['top']}>
          <Loader isLoading={isLoadingUserStorage} />
          <View
            className="bg-black-100 w-full flex items-center justify-center h-full px-6"
          >
            <View className="flex items-center justify-center gap-6 my-10">
              <Image
                source={images.logoGreen}
                className="w-[250px] h-10"
                resizeMode="contain"
              />

              <View className="flex gap-2">
                <Text className="text-3xl font-semibold text-white text-center">
                  Você tem 18 anos ou mais?
                </Text>

                <Text className="text-lg font-regular text-black-30 text-center ">
                  Confirmo que tenho 18 anos ou mais e que concordo com os termos de uso e políticas de privacidade .
                </Text>
              </View>
            </View>

          <View className="flex flex-col gap-4 w-full">
            <Button
              handlePress={() => router.replace("/welcome")}
              containerStyles="w-full mt-6"
              title='Tenho 18 anos ou mais'
            />

            <Button
              variant="outline"
              handlePress={() => router.replace("/unauthorized-access")}
              containerStyles="w-full mt-6"
              title="Tenho menos de 18 anos"
            />

            <Text className="text-base font-regular text-black-30 text-center">
              A Growzone exige que você atenda os requisitos legais de idade para visualizar os conteúdos da nossa plataforma.
            </Text>
          </View>
          </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
};

export default AgeDecision;
