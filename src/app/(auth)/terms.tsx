import Button from "@/components/ui/button";
import TermsCard from "@/components/ui/terms-card";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { terms } from "@/constants/mock";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { useNavigation } from "expo-router";
import { ArrowLeft, ChevronRight, Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InfoCard from "@/components/ui/info-card";
import { StatusBar } from "expo-status-bar";
import images from "@/constants/images";
import { getLegalDocument, LegalDocumentResponse } from "@/api/auth/legal-document";

export default function Terms() {
  const navigation = useNavigation();
  const { title, description, Icon } = screens["preference-center"];

  const [legalDocument, setLegalDocument] = useState<LegalDocumentResponse[]>([]);

  // Chamar a promise dentro do useEffect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getLegalDocument();
        setLegalDocument(data);
        console.log(data)
      } catch (error) {
        console.error("Erro ao buscar o documento legal:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <SafeAreaView className="bg-black-100 h-full">
        <ScrollView className="bg-black-100 pb-10">
          <View
            className="w-full flex items-center h-full px-6"
            style={{
              minHeight: Dimensions.get("window").height - 100,
            }}
          >
            <View className="flex items-center justify-center gap-6 my-10">
              <Image
                source={images.logoGreen}
                className="w-[250px] h-10"
                resizeMode="contain"
              />

              <View className="flex gap-2">
                <Text className="text-4xl font-semibold text-white text-center">
                  Termos e condições
                </Text>

                <Text className="text-lg font-regular text-black-30 text-center ">
                  Ao usar a Grwozone você concorda com todos os termos e
                  condições listados abaixo.
                </Text>
              </View>
            </View>

            <View className="w-full">
              <TouchableOpacity className="flex flex-row justify-between items-center gap-2 px-6 h-[72px] border-b-[1px] border-black-80">
                <View className="flex flex-row items-center gap-2">
                  <Icon width={24} height={24} />
                  <Text className="text-white text-base font-semibold">
                    {title}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.black[70]} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <StatusBar backgroundColor="#000000" style="light" />
    </>
  );
}
