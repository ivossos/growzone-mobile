import Button from "@/components/ui/button";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { screens } from "@/constants/screens";
import { colors } from "@/styles/colors";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EditProfile() {
  const navigation = useNavigation();
 
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateBirth: ""
  });

  const { title, description, Icon } = screens['edit-profile'];
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
              title="Nome completo"
              placeholder="Digite seu nome"
              value={form.name}
              handleChangeText={(e) => setForm({ ...form, name: e })}
              keyboardType="email-address"
            />

            <FormField
              title="Email"
              placeholder="Digite seu email"
              value={form.email}
              handleChangeText={(e) => setForm({ ...form, email: e })}
              keyboardType="email-address"
            />

            <FormField
              title="Celular"
              placeholder="Digite seu celular"
              value={form.phone}
              handleChangeText={(e) => setForm({ ...form, phone: e })}
              keyboardType="phone-pad"
            />

            <FormField
              title="Gênero"
              placeholder="Digite seu gênero"
              value={form.gender}
              handleChangeText={(e) => setForm({ ...form, gender: e })}
              keyboardType="default"
            />

            <FormField
              title="Data de nascimento"
              placeholder=""
              value={form.dateBirth}
              handleChangeText={(e) => setForm({ ...form, dateBirth: e })}
              keyboardType="default"
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