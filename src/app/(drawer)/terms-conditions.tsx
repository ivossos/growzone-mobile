import Button from "@/components/ui/button";
import TermsCard from "@/components/ui/terms-card";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { terms } from "@/constants/mock";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { router, useNavigation } from "expo-router";
import { ArrowLeft, ChevronRight, Lock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import InfoCard from "@/components/ui/info-card";
import Toast from "react-native-toast-message";
import { getLegalDocument, LegalDocumentResponse } from "@/api/auth/legal-document";
import images from "@/constants/images";
import FileIcon from "@/assets/icons/file.svg";
import Loader from "@/components/ui/loader";

export default function TermsConditions() {
  const navigation = useNavigation();
  const { title } = screens['terms-card'];

  const [isLoading, setIsLoading] = useState(false);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocumentResponse[]>([]);
  const [doc, setDoc] = useState<LegalDocumentResponse | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getLegalDocument();
        setLegalDocuments(data);
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
    navigation.goBack()
  }

  return (
    <>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <SafeAreaView>
          <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
            </TouchableOpacity>
            {!doc &&<Text className="text-white text-base font-semibold">{title}</Text>}
            {doc && <View className="flex flex-row items-center justify-start gap-2">
              <FileIcon width={20} height={20} />
              <Text className="text-white text-lg font-semibold">{doc?.title}</Text>
            </View>}
          </View>
          {!doc && <ScrollView className="bg-black-100 pb-10">
            <View className="w-full flex items-center h-full px-6">
              <View className="flex items-center justify-center gap-6 my-10">
                <Image
                  source={images.logoGreen}
                  className="w-[200px] h-10"
                  resizeMode="contain"
                />

              <InfoCard description="Ao utilizar o aplicativo Growzone, você concorda com as práticas descritas nesta política." />
              </View>
              <View className="w-full">
                {legalDocuments.map(doc => (
                  <TouchableOpacity 
                    key={doc.id} 
                    className="flex flex-row justify-between items-center gap-2 h-[72px] border-b-[1px] border-black-80"
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
      </View>
      <Loader isLoading={isLoading} />
    </>
  )
}