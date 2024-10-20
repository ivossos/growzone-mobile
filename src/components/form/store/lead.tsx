import { createLead } from "@/api/social/lead";
import Button from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { zodResolver } from "@hookform/resolvers/zod";
import { View } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Text } from "react-native";
import Toast from "react-native-toast-message";
import { z } from "zod";

export const LeadStoreValidation = z.object({
  name: z.string().min(1, "Campo obrigatório"),
  department: z.string().min(1, "Campo obrigatório"),
  productQtd: z.string()
  .min(1, "Campo obrigatório")
  .transform((val) => parseInt(val, 10)),
  billing: z.string()
  .min(1, "Campo obrigatório")
  .transform((val) => parseInt(val, 10)),
  erp: z.string(),
  
})

export default function LeadStore() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm({
    resolver: zodResolver(LeadStoreValidation),
    defaultValues: {
      name: '',
      department: '',
      productQtd: '',
      billing: '',
      erp: ''
    }
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
    <View
    className="flex flex-col items-center px-6 bg-red-500"
    style={{ flex: 1 }}
  >
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
      render={({  fieldState, field: { onChange, onBlur, value } }) => (
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
      render={({  fieldState, field: { onChange, onBlur, value } }) => (
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
      render={({  fieldState, field: { onChange, onBlur, value } }) => (
          <FormField
            title="Qtd de propdutos"
            placeholder="Quantidade"
            otherStyles="mt-6 w-full"
            keyboardType="decimal-pad"
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
      render={({  fieldState, field: { onChange, onBlur, value } }) => (
          <FormField
            title="Faturamento médio"
            placeholder="Digite e media de faturamento"
            otherStyles="mt-6 w-full"
            onBlur={onBlur}
            value={value}
            keyboardType="decimal-pad"
            handleChangeText={onChange}
            error={fieldState.error?.message}
          />
        )}
      />

    <Controller
      control={form.control}
      name="erp"
      render={({  fieldState, field: { onChange, onBlur, value } }) => (
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
        title='Enviar'
        isLoading={isLoading}
      />

  </View>
  )
}