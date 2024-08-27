import Button from "@/components/ui/button";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { useNavigation } from "expo-router";
import { ArrowLeft, Lock } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function Likes() {
  const navigation = useNavigation();
  return(
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">{}</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}