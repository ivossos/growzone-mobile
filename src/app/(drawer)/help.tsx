import { colors } from "@/styles/colors";
import { useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Linking, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Switch } from "@/components/Switch";
import { useState } from "react";
import { DrawerActions } from "@react-navigation/native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";
import Toast from "react-native-toast-message";
import { createTicket } from "@/api/social/ticket/create-ticket";

const descriptionEmail = 'Essa seção é destinada para envio de dúvidas referente ao uso do aplicativo. Retornaremos por e-mail em até 24hs.';
const descriptionChat = 'Esta seção é destinada ao envio de dúvidas relacionadas ao uso do aplicativo. Você será redirecionado para nosso WhatsApp, onde um atendente do suporte estará disponível para auxiliá-lo diretamente.';

export const HelpValidation = z.object({
  subject: z.string().min(2, "Assunto muito curto").max(150, "Assunto muito longo, máximo é 150 caracteres"),
  content: z.string().min(2, "Descrição muito curta"),
});

export default function PreferenceCenter() {
  const [isActive, setIsActive] = useState(false);
  const [isChatEnabled, setIsChatEnabled] = useState(false); 
  const [isEmailEnabled, setIsEmailEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const toggleMenu = () => {
    if(isActive) {
      setIsActive(false);
    } else {
      navigation.goBack();
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  const toggleChat = (type: 'chat' | 'email') => {
    if(type === 'chat') {
      if(isChatEnabled) {
        setIsChatEnabled(false);
      }
      else {
        setIsChatEnabled(true);
      }
      setIsEmailEnabled(false);
    } else {
      
      if(isEmailEnabled) {
        setIsEmailEnabled(false);
      } else {
        setIsEmailEnabled(true);
      }
      setIsChatEnabled(false);
    }
  } 

  const form = useForm({
    resolver: zodResolver(HelpValidation),
    defaultValues: {
      subject: '',
      content: '',
    },
  });

  const openWhatsApp = (content: string) => {
    let url = `whatsapp://send?phone=+5547991796857&text=${encodeURIComponent(content)}`;
  
    Linking.openURL(url).catch((err) => {
      console.error("Erro ao abrir o WhatsApp", err)
      Toast.show({
        type: 'info',
        text1: 'Opsss',
        text2: 'Parece que você nao tem o whatsapp instalado.',
      });
    });
  };

  const handleAdvance = () => {
    if (isChatEnabled || isEmailEnabled) {
      setIsActive(true);
    } else {
      Toast.show({
        type: 'error',
        text1: 'Selecione um método',
        text2: 'Escolha chat ou e-mail antes de continuar',
      });
    }
  };

  async function submit(values: z.infer<typeof HelpValidation>) {
    try {
      setIsLoading(true);
      
      if(isEmailEnabled) {
        await createTicket(values.subject, values.content);
      }

      if(isChatEnabled) {
        openWhatsApp(values.content)
      }

      Toast.show({
        type: 'success',
        text1: 'Booa',
        text2: 'Sua solicitação foi enviada com sucesso',
      });

      form.reset();
      setIsChatEnabled(false);
      setIsEmailEnabled(false);
      setIsActive(false);
      setTimeout(() => {
        toggleMenu();
      }, 300)

    } catch (err) {
      console.log('Erro ao enviar pedido de ajuda', err);
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Ocorreu um erro ao enviar pedido de ajuda',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={toggleMenu}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">Ajuda</Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          
          {!isActive ? (
            // Fase 1: Seleção de método de contato
            <View className="flex flex-col gap-6 py-6 px-6 pb-24">
              <Text className="text-brand-grey text-base font-regular">{'Como você gostaria de entrar em contato conosco?'}</Text>
              <View className="flex flex-col gap-6">
                {/* Switch para o Chat */}
                <View className="flex flex-row items-center gap-4"> 
                  <Switch value={isChatEnabled} onValueChange={() => toggleChat('chat')} />
                  <View className="flex flex-col">
                    <Text className="text-white text-sm font-medium">Chat</Text>
                    <Text className="text-brand-grey text-sm font-regular">Você será direcionado para uma conversa via WhatsApp</Text>
                  </View>
                </View>

                {/* Switch para o E-mail */}
                <View className="flex flex-row items-center gap-4"> 
                  <Switch value={isEmailEnabled} onValueChange={() => toggleChat('email')} />
                  <View className="flex flex-col">
                    <Text className="text-white text-sm font-medium">E-mail</Text>
                    <Text className="text-brand-grey text-sm font-regular">Sua dúvida será respondida via e-mail</Text>
                  </View>
                </View>
              </View>

              {(isChatEnabled || isEmailEnabled) && (
                <Button
                  handlePress={handleAdvance}
                  containerStyles="w-full mt-6"
                  title='Avançar'
                />
              )}
            </View>
          ) : (
            <View className="flex flex-col gap-6 py-6 px-6 pb-24">
              <Text className="text-brand-grey text-base font-regular">{ isChatEnabled ?  descriptionChat : descriptionEmail}</Text>
              <View className="flex flex-col gap-6">
                <Controller
                  control={form.control}
                  name="subject"
                  render={({ fieldState, field: { onChange, onBlur, value } }) => (
                    <FormField
                      title="Assunto"
                      placeholder="Digite seu assunto"
                      otherStyles="mt-6 w-full"
                      onBlur={onBlur}
                      value={value}
                      handleChangeText={onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="content"
                  render={({ fieldState, field: { onChange, onBlur, value } }) => (
                    <FormField
                      title="Descrição"
                      placeholder="Digite sua descrição"
                      otherStyles="mt-6 w-full"
                      onBlur={onBlur}
                      value={value}
                      handleChangeText={onChange}
                      error={fieldState.error?.message}
                      multiline
                      numberOfLines={3}
                      containerStyles="h-40"
                    />
                  )}
                />
              </View>
              <Button
                handlePress={form.handleSubmit(submit)}
                containerStyles="w-full mt-6"
                title="Enviar"
                isLoading={isLoading}
              />
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
