import { useState } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import images from "@/constants/images";

import Button from "@/components/ui/button";
import { ArrowRight, AtSign, Lock } from "lucide-react-native";
import Divider from "@/components/ui/divider";
import { FormField } from "@/components/ui/form-field";


const SignIn = () => {
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert("Error", "Please fill in all fields");
    }

    setSubmitting(true);

    Alert.alert("Success", "User signed in successfully");
      router.replace("/");
  };

  return (
    <SafeAreaView className="bg-black-100 h-full">
      <ScrollView>
        <View
          className="w-full flex items-center justify-center h-full px-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
           <View className="flex items-center justify-center gap-6 my-10">
            <Image source={images.logoGreen} className='w-[250px] h-10'  resizeMode='contain'/>

            <View className="flex gap-2">
              <Text className="text-4xl font-semibold text-white text-center">
                Seja bem-vindo ao Growzone!
              </Text>
              
              <Text className="text-lg font-regular text-black-30 text-center ">
                Digite seu email e senha para conectar-se com a comunidade.
              </Text>
            </View>
           </View>

            <FormField
              title="Email"
              placeholder="Digite seu email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              otherStyles="mt-6"
              keyboardType="email-address"
              leftIcon={AtSign}
            />

            <FormField
              title="Password"
              placeholder="•••••••••"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              otherStyles="mt-6"
              leftIcon={Lock}
            />

            <Button
              handlePress={() => router.push("/community")}
              containerStyles="w-full mt-6"
              title='Conectar-se'
              isLoading={isSubmitting}
            />

            <Divider text="Ou" />

          <View className="flex flex-col justify-center w-full gap-2">
            <Text className="text-center text-lg text-gray-100 font-medium">
              Ainda não possui uma conta?
            </Text>
            <Button
              variant="outline"
              handlePress={() => router.push("/sign-up")}
              containerStyles="mt-6"
              title='Crie agora'
              rightIcon={ArrowRight}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;