import { colors } from "@/styles/colors";
import { useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/ui/form-field";
import Button from "@/components/ui/button";

export const LeadStoreValidation = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  department: z.string().min(1, "Campo obrigatório"),
  productQtd: z
    .string()
    .min(1, "Campo obrigatório")
    .transform((val) => parseInt(val, 10)),
  billing: z
    .string()
    .min(1, "Campo obrigatório")
    .transform((val) => {
      const numericValue = val.replace(/[^\d]/g, "");
      return Math.round(parseInt(numericValue, 10) / 100);
    }),
  erp: z.string(),
});

import { KeyboardAvoidingView, Platform } from "react-native";
import Toast from "react-native-toast-message";
import { createLead } from "@/api/social/lead";
import AnimatedSuccess from "@/components/ui/animated-success";

export default function LeadStore() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const navigation = useNavigation();

  const form = useForm({
    resolver: zodResolver(LeadStoreValidation),
    defaultValues: {
      name: "",
      department: "",
      productQtd: "",
      billing: "",
      erp: "",
    },
  });

  async function submit(values: z.infer<typeof LeadStoreValidation>) {
    try {
      setIsLoading(true);

      await createLead({
        average_revenue: values.billing,
        department: values.department,
        erp_name: values.erp,
        product_quantity: values.productQtd,
        store_name: values.name
      });

      form.reset();
      setIsSubmitted(true);
    } catch (err) {
      console.log("Erro ao enviar pedido de ajuda", err);
      Toast.show({
        type: "error",
        text1: "Opss",
        text2: "Ocorreu um erro ao enviar pedido de ajuda",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const toggleMenu = () => {
    form.reset();
    navigation.goBack();
  };

  const formatToBRL = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    const formattedValue = (Number(numericValue) / 100).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
    return formattedValue;
  };

  const SuccessfullyPage = () => (
    <View className="flex flex-col items-center flex-1 gap-14 p-6 bg-black-100">
      <AnimatedSuccess />
      <Text className="text-3xl text-white text-center font-semibold">
        Formulário preenchido com sucesso!
      </Text>
      <Text className="text-base font-medium text-center text-brand-grey max-w-72">
        Em breve será possível você montar sua loja e vender seus produtos no
        Marketplace da Growzone.
      </Text>

      <TouchableOpacity
        className="flex justify-center items-center min-h-[56px] px-4 border border-black-80 rounded-lg w-full"
        onPress={toggleMenu}
      >
        <Text className="text-white text-base font-medium">Voltar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-black-100 overflow-hidden">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={-40}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
            <TouchableOpacity onPress={toggleMenu}>
              <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
            </TouchableOpacity>
            <Text className="text-white text-base font-semibold">
              Marketplace
            </Text>
          </View>
          {isSubmitted ? (
            SuccessfullyPage()
          ) : (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="flex flex-col gap-6 py-6 px-6 pb-24">
                <View className="flex flex-col items-center justify-center gap-2">
                  <Text className="text-4xl font-semibold text-white text-center">
                    Marketplace
                  </Text>

                  <Text className="text-lg font-regular text-black-30 text-center ">
                    Quer vender seus produtos no Marketplace da Growzone?
                  </Text>
                </View>

                <Controller
                  control={form.control}
                  name="name"
                  render={({
                    fieldState,
                    field: { onChange, onBlur, value },
                  }) => (
                    <FormField
                      title="Nome de loja"
                      placeholder="Digite o nome da sua loja"
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
                  name="department"
                  render={({
                    fieldState,
                    field: { onChange, onBlur, value },
                  }) => (
                    <FormField
                      title="Nome do departamento"
                      placeholder="Digite o nome do departamento"
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
                  name="productQtd"
                  render={({
                    fieldState,
                    field: { onChange, onBlur, value },
                  }) => (
                    <FormField
                      title="Qtd de propdutos"
                      placeholder="Quantidade"
                      otherStyles="mt-6 w-full"
                      keyboardType="number-pad"
                      onBlur={onBlur}
                      value={value}
                      handleChangeText={onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Controller
                  control={form.control}
                  name="billing"
                  render={({
                    fieldState,
                    field: { onChange, onBlur, value },
                  }) => {
                    const handleTextChange = useCallback(
                      (text: string) => {
                        const formattedValue = formatToBRL(text);
                        onChange(formattedValue);
                      },
                      [onChange]
                    );

                    return (
                      <FormField
                        title="Faturamento médio"
                        placeholder="Digite e media de faturamento"
                        otherStyles="mt-6 w-full"
                        onBlur={onBlur}
                        value={value}
                        keyboardType="number-pad"
                        handleChangeText={handleTextChange}
                        error={fieldState.error?.message}
                      />
                    );
                  }}
                />

                <Controller
                  control={form.control}
                  name="erp"
                  render={({
                    fieldState,
                    field: { onChange, onBlur, value },
                  }) => (
                    <FormField
                      title="Utiliza algum ERP? Qual?"
                      placeholder="Digite o ERP que utiliza"
                      otherStyles="mt-6 w-full"
                      onBlur={onBlur}
                      value={value}
                      handleChangeText={onChange}
                      error={fieldState.error?.message}
                    />
                  )}
                />

                <Button
                  handlePress={form.handleSubmit(submit)}
                  containerStyles="w-full mt-6"
                  title="Enviar"
                  isLoading={isLoading}
                />
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
}
