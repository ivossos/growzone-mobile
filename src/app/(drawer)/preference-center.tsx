import TermsCard from "@/components/ui/terms-card";
import ConfigHeader from "@/components/ui/config-header";
import { terms } from "@/constants/mock";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InfoCard from "@/components/ui/info-card";
import { Switch } from "@/components/Switch";
import { useState } from "react";

export default function PreferenceCenter() {
  const [isActive, setIsActive] = useState(true);
  const toggle = () => setIsActive(prev => !prev)
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
            <View className="flex flex-col gap-6">
              <View className="flex flex-row items-center gap-4"> 
                <Switch />
                <View className="flex flex-col">
                  <Text className="text-white text-sm font-medium">Informativos</Text>
                  <Text className="text-brand-grey text-sm font-regular">Anúncios e ofertas especiais <Text className="text-brand-grey text-xs font-regular italic">(raramente)</Text></Text>
                </View>
              </View>
              <View className="flex flex-row items-center gap-4"> 
                <Switch />
                <View className="flex flex-col flex-wrap">
                  <Text className="text-white text-sm font-medium">Notificações no aplicativo</Text>
                  <Text className="text-brand-grey text-sm font-regular inline whitespace-pre-wrap" numberOfLines={2}>Receba notificações para ficar por dentro da rede social Growzone.</Text>
                </View>
              </View>
              <View className="flex flex-row items-center gap-4"> 
                <Switch />
                <View className="flex flex-col">
                  <Text className="text-white text-sm font-medium">Notificações por email</Text>
                  <Text className="text-brand-grey text-sm font-regular" numberOfLines={2}>Receber um resumo de notificações por email em vez de emails individuais</Text>
                </View>
              </View>
              <View className="flex flex-row items-center gap-4"> 
                <Switch 
                  value={isActive} 
                  onChange={toggle} 
                  thumbColor={isActive ? colors.primary : colors.black[70]} 
                  trackColor={{
                    false: colors.black[80],
                    true: colors.black[80], 
                  }}
                />
                <View className="flex flex-col flex-wrap">
                  <Text className="text-white text-sm font-medium">Perfil Invisível para Mecanismos de Busca</Text>
                  <Text className="text-brand-grey text-sm font-regular  inline whitespace-pre-wrap">Não permitir que mecanismos de pesquisa indexem meu perfil</Text>
                </View>
              </View>

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}