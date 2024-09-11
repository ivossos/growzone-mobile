import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image, TouchableOpacity } from "react-native";
import images from "@/constants/images";

import Button from "@/components/ui/button";
import { ArrowRight, AtSign, Lock, Mail, Phone } from "lucide-react-native";
import Divider from "@/components/ui/divider";
import { FormField } from "@/components/ui/form-field";
import { Checkbox } from "@/components/Checkbox";
import { colors } from "@/styles/colors";

const Auth = () => {
  
  return (
    <SafeAreaView className="bg-black-100 h-full">
        <View
          className="bg-black-100 w-full flex items-center justify-center h-full px-6"
          // style={{
          //   minHeight: Dimensions.get("window").height - 100,
          // }}
        >
          <View className="flex items-center justify-center gap-6 my-10">
            <Image
              source={images.logoGreen}
              className="w-[250px] h-10"
              resizeMode="contain"
            />

            <View className="flex gap-2">
              <Text className="text-4xl font-semibold text-white text-center">
                Junte-se à comunidade Growzone
              </Text>

              <Text className="text-lg font-regular text-black-30 text-center ">
                Conecte, aprenda e cresça na cultura da cannabis!
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4"
          >
            <Phone width={24} height={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium text-center">Continuar com o Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.7}
            className="bg-black-90 rounded-lg min-h-[56px] px-4 flex flex-row justify-start items-center w-full gap-4 mt-6"
          >
            <Mail width={24} height={24} color={colors.primary} />
            <Text className="text-white text-lg font-medium text-center">Continuar com o Email</Text>
          </TouchableOpacity>

          <Divider text="Ou" />

          <View className="flex flex-col justify-center w-full gap-2">
            <Text className="text-center text-lg text-gray-100 font-medium">
              Ainda não possui uma conta?
            </Text>
            <Button
              variant="outline"
              handlePress={() => router.push("/sign-up")}
              containerStyles="mt-6"
              title="Crie agora"
              rightIcon={ArrowRight}
            />
          </View>
        </View>
    </SafeAreaView>
  );
};

export default Auth;
