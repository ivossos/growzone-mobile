import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View, Dimensions, TouchableOpacity, Image } from "react-native";
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
import { router } from "expo-router";



const signUpSchema = z
  .object({
    username: z
      .string()
      .min(1, "Nome de usuário é obrigatório")
      .max(15, "Nome de usuário deve ter no máximo 15 caracteres.")
      .regex(/^(?![.])(?!.*[.]{2})(?!.*[.]$)[A-Za-z\d._]+$/, {
        message: "Nome de usuário inválido.",
      }),
    // fieldType: z.enum(['email', 'phone']),
    email: z
      .string()
      .email("Digite um e-mail válido"),
    // phone: z
    //   .string()
    //   .optional(),
    code: z.string(),
    password: z
      .string()
      .min(6, "Senha fraca demais")
      .max(30, "Máximo é 30 caracteres")
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$!%&*])[A-Za-z\d@#$!%&*]+$/, {
        message: "A senha deve conter pelo menos uma letra maiúscula, uma minúscula, um número e um caractere especial.",
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas estão diferentes",
    path: ["confirmPassword"],
  })
//   .refine(data => {
//     if (data.fieldType === 'email') return data.email !== undefined;
//     if (data.fieldType === 'phone') return data.phone !== undefined;
//     return true;
//   }, {
//     message: 'Campo obrigatório.',
//     path: ['email', 'phone'],
//   }
// );

type SignUpSchema = z.infer<typeof signUpSchema>;
type FieldKeys = keyof SignUpSchema;

export interface StepProps {
  control: Control<SignUpSchema>;
  handleSubmit: UseFormHandleSubmit<SignUpSchema>;
  onSubmit: () => void;
  onNext: (nextStep?: 'email' | 'phone') => void;
  onPrev?: () => void;
  isLoading: boolean;
  timer?: number;
  onResendCode?: () => void;
}

const initialSteps = [
  { 
    progress: 20,
    Component: UsernameStep,
    fields: ["username"] as FieldKeys[]
  },
  // {
  //   progress: 30,
  //   Component: ChannelStep,
  //   fields: [] as FieldKeys[]
  // },
  {
    progress: 30,
    Component: EmailStep,
    fields: ["email"] as FieldKeys[]
  },
  {
    progress: 70,
    Component: PasswordStep,
    fields: ["password", "confirmPassword"] as FieldKeys[], 
  },
  {
    progress: 100,
    Component: CodeStep,
    fields: ["code"] as FieldKeys[]
  },
];

const emailStep = {
  progress: 40,
  Component: EmailStep,
  fields: ["email"] as FieldKeys[]
};

// const phoneStep = {
//   progress: 40,
//   Component: PhoneStep,
//   fields: ["phone"] as FieldKeys[]
// };

const SignUp = () => {
  const methods = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "all",
    defaultValues: {
      username: "",
      email: "",
      code: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(initialSteps[0].progress);
  const [steps, setSteps] = useState(initialSteps);
  const { trigger, handleSubmit } = methods;

  const onNext = async (nextStep?: 'email' | 'phone') => {
    const { fields } = steps[currentStep];
    const formData = methods.getValues();
    
    if (fields.length > 0) {
      const isValid = await trigger(fields);
      if (!isValid) return;
    }

    setCurrentStep((prev) => prev + 1);
    setProgress(steps[currentStep + 1]?.progress || 100);

    // if (steps[currentStep].Component === ChannelStep && nextStep) {
    //   const nextSteps = [...initialSteps];
    //   const index = nextSteps.findIndex(step => step.Component === ChannelStep);
    //   nextSteps.splice(index + 1, 0, nextStep === 'email' ? emailStep : phoneStep);
    //   setSteps(nextSteps);
    //   setCurrentStep(index + 1);
    //   setProgress(nextSteps[index + 1]?.progress || 100);
    // } else {
    //   setCurrentStep((prev) => prev + 1);
    //   setProgress(steps[currentStep + 1]?.progress || 100);
    // }
    
  };

  const onPrev = () => {

    if(currentStep === 3) {
      router.back()
    } 
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setProgress(steps[currentStep - 1]?.progress || 0);
    } else {
      router.back()
    }
  };

  const onSubmit = async () => {
    router.replace("/sign-in");
  };

  const CurrentComponent = steps[currentStep].Component;

  return (
    <SafeAreaView className="bg-black-100 h-full" style={{ flex: 1 }} edges={['top']}>
      <View className="flex flex-row items-center justify-between bg-black-100 w-full px-6 min-h-14 border-b-[1px] border-black-80">
        <TouchableOpacity activeOpacity={0.7} onPress={onPrev}>
          <ArrowLeft width={24} height={24} color={colors.brand.white} />
        </TouchableOpacity>
        <Progress value={progress} className="max-h-1 max-w-20" />
      </View>
      <KeyboardAwareScrollView className="bg-black-100" showsVerticalScrollIndicator={false}
       extraScrollHeight={-200}
       
       contentContainerStyle={{ flexGrow: 1 }}
       keyboardShouldPersistTaps="handled">
        <View
          className="w-full flex items-center h-full px-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <FormProvider {...methods}>
            <View className="flex items-center justify-center my-10 mb-5">
              <Image
                source={images.logoGreen}
                className="w-[250px] h-10"
                resizeMode="contain"
              />

            </View>

            <CurrentComponent
              control={methods.control}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              onNext={onNext}
              onPrev={onPrev}
              isLoading={isLoading}
            />
          </FormProvider>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
