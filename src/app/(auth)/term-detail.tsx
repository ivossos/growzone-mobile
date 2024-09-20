import Button from "@/components/ui/button";
import TermsCard from "@/components/ui/terms-card";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { terms } from "@/constants/mock";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { useNavigation } from "expo-router";
import { ArrowLeft, Lock } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InfoCard from "@/components/ui/info-card";

export default function Terms() {
  const navigation = useNavigation();
  const { title, description, Icon } = screens['preference-center'];
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

            <ConfigHeader title={title} description={description} Icon={Icon}/>
            <InfoCard description="Ao utilizar o aplicativo Growzone, você concorda com as práticas descritas nesta política." />
            <TermsCard data={terms} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}