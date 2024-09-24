import Button from "@/components/ui/button";
import TermsCard from "@/components/ui/terms-card";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { terms } from "@/constants/mock";
import FileIcon from "@/assets/icons/file.svg";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { router, useNavigation } from "expo-router";
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
import Loader from "@/components/ui/loader";
import Toast from "react-native-toast-message";
import { HTMLSource } from "react-native-render-html";

export default function Terms() {
  const navigation = useNavigation();
  const { description } = screens["preference-center"];

  const [isLoading, setIsLoading] = useState(false);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocumentResponse[]>([]);
  const [doc, setDoc] = useState<LegalDocumentResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getLegalDocument();
        setLegalDocuments(data);
        console.log(data);
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Opss',
          text2: 'Aconteceu um erro ao buscar os termos", "Tente novamente mais tarde.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  function handleSelectedDocument(doc: LegalDocumentResponse) {
    setDoc(doc);
  }

  function handleBack() {
    if(doc) {
      setDoc(null);
      return;
    } 
    router.back();
  }

  return (
    <>
      <SafeAreaView className="bg-black-100 h-full">
      <View className="flex flex-row items-center justify-between bg-black-100 w-full px-6 min-h-14 border-b-[1px] border-black-80">
        <TouchableOpacity activeOpacity={0.7} onPress={handleBack} className="flex flex-row items-center justify-start gap-4">
          <ArrowLeft width={24} height={24} color={colors.brand.white} />
          
          {doc && <View className="flex flex-row items-center justify-start gap-2">
            <FileIcon width={20} height={20} />
            <Text className="text-white text-lg font-semibold">{doc?.title}</Text>
          </View>}
          
          
        </TouchableOpacity>
      </View>
        {!doc && <ScrollView className="bg-black-100 pb-10">
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
                  Ao usar a Growzone você concorda com todos os termos e
                  condições listados abaixo.
                </Text>
              </View>
            </View>
            <View className="w-full">
              {legalDocuments.map(doc => (
                <TouchableOpacity 
                  key={doc.id} 
                  className="flex flex-row justify-between items-center gap-2 px-6 h-[72px] border-b-[1px] border-black-80"
                  onPress={() => handleSelectedDocument(doc)}
                >
                  <View className="flex flex-row items-center gap-2">
                    <FileIcon width={24} height={24} />
                    <Text className="text-white text-base font-semibold">
                      {doc.title}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.black[70]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>}
        {doc && <ScrollView showsVerticalScrollIndicator={false} className="bg-black-100">
          <View className="flex flex-col gap-6 py-6 px-6 pb-24">
            <InfoCard description="Ao utilizar o aplicativo Growzone, você concorda com as práticas descritas nesta política." />
            <TermsCard html={doc.content} />
          </View>
        </ScrollView>}

      </SafeAreaView>
      <Loader isLoading={isLoading} />
      <StatusBar backgroundColor={colors.black[90]} style="light" />
    </>
  );
}
