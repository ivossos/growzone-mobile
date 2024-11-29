import { Fragment, useState } from "react";
import { colors } from "@/styles/colors";
import { router, useNavigation } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"

import { DrawerActions } from "@react-navigation/native";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import Toast from "react-native-toast-message";

import { useAuth } from "@/hooks/use-auth";
import AnimatedSuccess from "@/components/ui/animated-success";
import Countdown from "@/components/ui/countdown";
import { deleteAccount } from "@/api/social/user/account/delete-account";
import { getInitials } from "@/lib/utils";
import { AlertOctagonIcon, ChevronLeft, CircleXIcon } from "lucide-react-native";

export default function DeleteAccountScreen() {
  const [isDeleteAccount, setIsDeleteAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  
  const toggleMenu = () => {
    navigation.goBack();
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try{
      await deleteAccount();
      setIsDeleteAccount(true)
      setIsLoading(false);

      setTimeout(async () => {
        await signOut();
        router.replace("/sign-in");
      }, 5200);

    } catch(err) {
      console.log("Erro excluir a conta", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Ocorreu um erro ao excluir sua conta. Tente novamente",
      });
    } 
  };

  const SuccessDeleteAccount = () =>  (
    <View className='flex flex-col items-center justify-center flex-1 gap-14 p-6 bg-black-100'>
      <AnimatedSuccess />
      <Text className="text-3xl text-white text-center font-semibold">
        Sua conta foi excluída com sucesso
      </Text>
      <Text className="text-base font-medium text-center text-brand-grey max-w-80">
        Você será redirecionado em:
      </Text>  
      <Countdown start={5} onFinish={() => {}} />
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
    <View className="flex-1 bg-black-100">
      { isDeleteAccount ? 
        <SuccessDeleteAccount /> : 
        <Fragment>
          <View className="flex flex-row items-center justify-start gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
            <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={toggleMenu}>
              <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
            </TouchableOpacity>
            <Text className="text-white text-base font-semibold">Excluir conta</Text>
          </View>
          <View className="flex flex-col gap-6 p-6">
          <View className="flex flex-col items-center gap-2 ">
              <Avatar className="bg-black-80 border border-brand-green" style={{ width: 80, height: 80 }}>
                {user?.image?.image ? (
                    <AvatarImage
                      className="rounded-full"
                      source={{ uri: user.image.image }}
                      resizeMode="contain"
                    />
                  ) : (
                    <AvatarFallback textClassname="text-lg">
                      {getInitials(user?.name || user?.username)}
                    </AvatarFallback>
                  )}
              </Avatar>
              <Text className="text-3xl text-white text-center font-semibold">{user?.name || user?.username}</Text>
              <Text className="text-base font-bold text-center text-brand-grey max-w-80">Você esta prestes a excluir sua conta!</Text>  
            </View>

            <View className="flex flex-col items-start h-auto mx-auto gap-8 bg-black-100 mt-8 ">
              <View className="flex flex-row items-center justify-start gap-4 w-full px-4">
                <AlertOctagonIcon size={24} color={colors.brand.yellow} />
                <View className="flex flex-col gap-1">
                  <Text className="text-lg text-brand-white font-semibold text-left">
                    A exclusão da sua conta é permanente
                  </Text>
                  <Text className="text-sm text-brand-grey font-normal text-left">
                    Seu perfil, fotos, vídeos, comentários, curtidas e seguidores serão excluidos permanentemente.
                  </Text>
                </View>
              </View>

              <View className="flex flex-row items-center justify-start gap-4 w-full px-4">
                <CircleXIcon size={24} color={colors.brand.error} />
                <View className="flex flex-col gap-1">
                  <Text className="text-lg text-brand-white font-semibold text-left">
                    Esta ação é irreversível
                  </Text>
                  <Text className="text-sm text-brand-grey font-normal text-left">
                    Não será possível recuperar a sua conta.
                  </Text>
                </View>
              </View>

            </View>

            <TouchableOpacity 
              className="flex justify-center items-center min-h-[56px] px-4 bg-brand-green rounded-lg w-full mt-4" 
              onPress={toggleMenu}
              disabled={isLoading}
            >
              <Text className="text-brand-black text-base font-medium">Não tenho certeza!</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full mt-1" 
              onPress={handleDelete}
              disabled={isLoading}
            >
              <Text className="text-brand-white text-base font-medium">Excluir</Text>
            </TouchableOpacity>
            

          </View>
        </Fragment>
      }
    </View>
  </SafeAreaView>
  )
}