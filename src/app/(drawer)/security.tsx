import Button from "@/components/ui/button";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { useNavigation } from "expo-router";
import { ArrowLeft, Lock } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Security() {
  const navigation = useNavigation();
 
  const [form, setForm] = useState({
    password: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { title, description, Icon } = screens['security'];
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

            <FormField
              title="Senha atual"
              placeholder="•••••••••"
              value={form.password}
              handleChangeText={(e) => setForm({ ...form, password: e })}
              type="password"
              leftIcon={Lock}
            />

            <FormField
              title="Nova senha"
              placeholder="•••••••••"
              value={form.newPassword}
              handleChangeText={(e) => setForm({ ...form, newPassword: e })}
              type="password"
              leftIcon={Lock}
            />

            <FormField
              title="Confirmar nova senha"
              placeholder="•••••••••"
              value={form.confirmPassword}
              handleChangeText={(e) => setForm({ ...form, confirmPassword: e })}
              type="password"
              leftIcon={Lock}
            />

            <Button
              handlePress={() => {}}
              containerStyles="w-full"
              title="Salvar alterações"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}