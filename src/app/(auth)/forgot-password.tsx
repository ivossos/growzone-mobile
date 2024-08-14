import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from "react-native";
import images from "@/constants/images";

import { ArrowLeft } from "lucide-react-native";
import { colors } from "@/styles/colors";
import { Progress } from "@/components/Progress";
import { z } from "zod";
import { Control, FormProvider, useForm, UseFormHandleSubmit } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import UsernameStep from "@/components/form/sign-up/username-step";
import EmailStep from "@/components/form/sign-up/email-step";
import CodeStep from "@/components/form/sign-up/code-step";
import PasswordStep from "@/components/form/sign-up/password-step";
import PhoneStep from "@/components/form/sign-up/phone-step";
import ChannelStep from "@/components/form/sign-up/channel-step";
import TermsStep from "@/components/form/sign-up/terms-step";
import { router } from "expo-router";

const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1, "Username é obrigatório")
      .max(15, "Nome deve ter no máximo 15 caracteres."),
    fieldType: z.enum(['email', 'phone']),
    email: z
      .string()
      .email("Digite um e-mail válido")
      .optional(),
    phone: z
      .string()
      .optional(),
    code: z.string(),
    password: z
      .string()
      .min(6, "Senha fraca demais")
      .max(30, "Máximo é 30 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas estão diferentes",
    path: ["confirmPassword"],
  })
  .refine(data => {
    if (data.fieldType === 'email') return data.email !== undefined;
    if (data.fieldType === 'phone') return data.phone !== undefined;
    return true;
  }, {
    message: 'Campo obrigatório.',
    path: ['email', 'phone'],
  });

type SignUpSchema = z.infer<typeof signUpSchema>;
type FieldKeys = keyof SignUpSchema;

export interface StepProps {
  control: Control<SignUpSchema>;
  handleSubmit: UseFormHandleSubmit<SignUpSchema>;
  onSubmit: (data: SignUpSchema) => void;
  onNext: (nextStep?: 'email' | 'phone') => void;
  onPrev?: () => void;
}

const initialSteps = [
  
  {
    progress: 20,
    Component: ChannelStep,
    fields: [] as FieldKeys[]
  },
  {
    progress: 60,
    Component: CodeStep,
    fields: ["code"] as FieldKeys[]
  },
  {
    progress: 80,
    Component: PasswordStep,
    fields: ["password", "confirmPassword"] as FieldKeys[]
  },
];

const emailStep = {
  progress: 40,
  Component: EmailStep,
  fields: ["email"] as FieldKeys[]
};

const phoneStep = {
  progress: 40,
  Component: PhoneStep,
  fields: ["phone"] as FieldKeys[]
};

const ForgotPassword = () => {
  const methods = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "all",
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(initialSteps[0].progress);
  const [steps, setSteps] = useState(initialSteps);
  const { trigger, handleSubmit } = methods;

  const onNext = async (nextStep?: 'email' | 'phone') => {
    const { fields } = steps[currentStep];
    if (fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) return;
    }

    if (steps[currentStep].Component === ChannelStep && nextStep) {
      const nextSteps = [...initialSteps];
      const index = nextSteps.findIndex(step => step.Component === ChannelStep);
      nextSteps.splice(index + 1, 0, nextStep === 'email' ? emailStep : phoneStep);
      setSteps(nextSteps);
      setCurrentStep(index + 1);
      setProgress(nextSteps[index + 1]?.progress || 100);
    } else {
      setCurrentStep((prev) => prev + 1);
      setProgress(steps[currentStep + 1]?.progress || 100);
    }
  };

  const onPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setProgress(steps[currentStep - 1]?.progress || 0);
    }
  };

  const onSubmit = (data: SignUpSchema) => {
    console.log(data);
    router.replace("/");
  };

  const CurrentComponent = steps[currentStep].Component;

  return (
    <SafeAreaView className="bg-black-100 h-full">
      <View className="flex flex-row items-center justify-between w-full px-6 min-h-14 border-b-[1px] border-black-80">
        <TouchableOpacity activeOpacity={0.7} onPress={onPrev}>
          <ArrowLeft width={24} height={24} color={colors.brand.white} />
        </TouchableOpacity>
        <Progress value={progress} className="max-h-1 max-w-20" />
      </View>
      <ScrollView>
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
                {currentStep === 0
                  ? "Esqueceu sua senha?"
                  : currentStep === 1
                  ? "Esqueceu sua senha?"
                  : currentStep === 2
                  ? "Enviamos um código de verificação para seu email"
                  : currentStep === 3
                  ? "Crie uma nova senha"
                  : currentStep === 4
                  ? "Esqueceu sua senha?"
                  : "Política de privacidade"}
              </Text>

              <Text className="text-lg font-regular text-black-30 text-center ">
                {currentStep === 0
                  ? "Escolha como você deseja receber seu código de verificação."
                  : currentStep === 1
                  ? "Preencha abaixo com seu email para receber as instruções necessárias para criar uma nova senha."
                  : currentStep === 2
                  ? "Informe o código de 6 dígitos enviado no email pedro*****@gmail.com para continuar."
                  : currentStep === 3
                  ? "Digite uma nova senha e confirme para recuperar o acesso à sua conta."
                  : currentStep === 4
                  ? ""
                  : "Leia e aceite a nossa política de privacidade."}
              </Text>
            </View>
          </View>

          <FormProvider {...methods}>
            <CurrentComponent
              control={methods.control}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              onNext={onNext}
              onPrev={onPrev}
            />
          </FormProvider>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;
