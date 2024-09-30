import { updateUser } from "@/api/social/profile/update-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import Button from "@/components/ui/button";
import ConfigHeader from "@/components/ui/config-header";
import { FormField } from "@/components/ui/form-field";
import { screens } from "@/constants/screens";
import { useAuth } from "@/hooks/use-auth";
import { formatDate, formatDateApi, getInitials, maskDate, maskPhone } from "@/lib/utils";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useNavigation } from "expo-router";
import { ArrowLeft, CalendarDays, Camera, Pencil } from "lucide-react-native";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";
import * as ImagePicker from 'expo-image-picker';
import { createUserImage } from "@/api/social/user/create-user-image";
import { LinearGradient } from "expo-linear-gradient";
import { createUserCover } from "@/api/social/user/create-user-cover";

export const EditProfileValidation = z.object({
  name: z.string().max(30, 'Nome pode ter no máximo 30 caracteres'),
  username: z
    .string()
    .min(1, "Nome de usuário é obrigatório")
    .max(15, "Nome de usuário deve ter no máximo 15 caracteres.")
    .regex(/^(?![.])(?!.*[.]{2})(?!.*[.]$)[A-Za-z\d._]+$/, {
      message: "Nome de usuário inválido.",
    }),
  biography: z.string().max(150, 'A biografia pode ter no máximo 150 caracteres'),
  email: z.string().email("Digite um e-mail válido").optional(),
  date_of_birth: z.string().optional().refine((value = '') => {
    if (!value) return true;
    return /^\d{2}\/\d{2}\/\d{4}$/.test(value);
  }, { message: 'Data deve estar no formato DD/MM/AAAA' }),
  phone: z.string().optional().refine((value = '') => {
    if (!value) return true;
    return /^\(\d{2}\) 9 \d{4}-\d{4}$/.test(value);
  }, { message: 'Número de celular deve estar no formato (DD) 9 9999-9999' }),
  image: z.custom<ImagePicker.ImagePickerAsset>().optional(),
  imageURL: z.string().optional(),
  cover: z.custom<ImagePicker.ImagePickerAsset>().optional(),
  coverURL: z.string().optional()
});

export default function EditProfile() {
  const [isLoading, setIsLoading] = useState(false);
  const { title, description, Icon } = screens['edit-profile'];
  const navigation = useNavigation();
  const { user, updateUserData } = useAuth();

  const form = useForm({
    resolver: zodResolver(EditProfileValidation),
    values: {
      name: user.name || '',
      username: user.username || '',
      biography: user.biography || '',
      email: user.email || '',
      phone: user.phone ? maskPhone(user.phone) : '',
      date_of_birth: user.date_of_birth ? formatDate(user.date_of_birth) : '',
      image: undefined,
      cover: undefined,
    }
  });

  async function handleImagePick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      form.setValue('image', result.assets[0] as any);
    }
  }

  async function handleCoverImagePick() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [21, 9],
      quality: 1,
    });

    if (!result.canceled) {
      form.setValue('cover', result.assets[0] as any);
    }
  }

  async function submit(values: z.infer<typeof EditProfileValidation>) {
    try {
      setIsLoading(true);
      await updateUser({
        name: values.name,
        username: values.username,
        email: values.username,
        biography: values.biography,
        date_of_birth: formatDateApi(values.date_of_birth),
        phone: values.phone?.replace(/[^0-9]/g, '') || undefined,
      });

      if(values.image) {
        await createUserImage(user.id,  values.image);
      }

      if(values.cover) {
        await createUserCover(values.cover);
      }

      await updateUserData();

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Seus dados foram atualizados com sucesso.',
      });

      form.reset();

      router.push({ pathname: '/profile/[id]', params: { id: user.id }});
      
    } catch (err) {
      console.error('Erro ao atualizar perfil', err);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Ocorreu um erro ao atualizar seu perfil, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavigation() {
    form.reset();
    navigation.goBack()
  }

  return (
    <View className="flex-1 bg-black-100">
      <SafeAreaView>
      <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
            <TouchableOpacity onPress={handleNavigation}>
              <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
            </TouchableOpacity>
            <Text className="text-white text-base font-semibold">{title}</Text>
          </View>
        
          <View className="flex flex-col gap-6 py-6 px-6">
            <ConfigHeader title={title} description={description} Icon={Icon} />
          </View>

          <View className="relative bg-black-60 mb-10">
          {form.watch('cover')?.uri ? (
              <Image
                source={{ uri: form.watch('cover')?.uri }}
                className="w-full h-40"
                resizeMode="cover"
              />
            ) : user.cover ? (
              <Image
                src={user.cover.cover}
                className="w-full h-40"
                resizeMode="cover"
              />
            ) : (
              <View className="bg-black-60 w-full h-40" />
            )}
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.11)", "rgba(255, 255, 255, 0.24)"]}

                style={[styles.blurContainer, {top: 20, right: 20 }]}
              >
                <TouchableOpacity onPress={handleCoverImagePick}>
                  <Camera size={14} color={colors.brand.white}/>
                </TouchableOpacity>
              </LinearGradient>

          

            <TouchableOpacity onPress={handleImagePick} className="flex flex-col justify-center items-center gap-4 px-6 absolute -bottom-14 py-6">
              <Avatar className="relative w-24 h-24 border border-brand-green bg-black-80">
                {form.watch('image')?.uri ? (
                  <AvatarImage className="rounded-full"  source={{ uri: form.watch('image')?.uri }}  />
                ) : (
                  <>
                    {user.image && <AvatarImage className="rounded-full" resizeMode="cover" src={user.image?.image} />}
                    <AvatarFallback>{getInitials(user.name || user.username)}</AvatarFallback>
                  </>
                )}
              </Avatar>
              <LinearGradient
                  colors={["rgba(255, 255, 255, 0.11)", "rgba(255, 255, 255, 0.36)"]}

                  style={[styles.blurContainer, { bottom: 20, right: 20 }]}
                >
                  <Camera size={14} color={colors.brand.white}/>
                </LinearGradient>
            </TouchableOpacity>
            </View>
          <View className="flex flex-col gap-6 py-6 px-6 pb-24">
            <Controller
            control={form.control}
            name="username"
            render={({  fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Nome de usuário"
                  placeholder="Digite seu nome de usuário"
                  onBlur={onBlur}
                  value={value}
                  handleChangeText={onChange}
                  error={fieldState.error?.message}
                  editable={false}
                />
              )}
            />

          <Controller
            control={form.control}
            name="name"
            render={({  fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Nome"
                  placeholder="Digite seu nome"
                  onBlur={onBlur}
                  value={value}
                  handleChangeText={onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="biography"
              render={({  fieldState, field: { onChange, onBlur, value } }) => (
                  <FormField
                    title="Biografia"
                    placeholder="Digite sua biografia"
                    onBlur={onBlur}
                    value={value}
                    containerStyles="h-40"
                    handleChangeText={onChange}
                    error={fieldState.error?.message}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />

        
            <Controller
            control={form.control}
            name="email"
            render={({  fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Email"
                  placeholder="Digite seu email"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  value={value}
                  editable={!user.email}
                  handleChangeText={onChange}
                  error={fieldState.error?.message}
                />
              )}
            />

          <Controller
            control={form.control}
            name="phone"
            render={({  fieldState, field: { onChange, onBlur, value } }) => {
              const handlePhoneChange = (text: string) => {
                onChange(maskPhone(text)); 
              }
              return (
                <FormField
                  title="Celular"
                  placeholder="(DD) 0 0000-0000"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  value={value}
                  editable={!user.phone}
                  handleChangeText={handlePhoneChange}
                  error={fieldState.error?.message}
                />
              )}}
            />

          <Controller
            control={form.control}
            name="date_of_birth"
            render={({  fieldState, field: { onChange, onBlur, value } }) => {
              const handleDateChange = (text: string) => {
                const maskdDate = maskDate(text);
                onChange(maskdDate);
              }
              return (
                <FormField
                  title="Data de nascimento"
                  placeholder="11/08/1947"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  value={value}
                  leftIcon={CalendarDays}
                  handleChangeText={handleDateChange}
                  error={fieldState.error?.message}
                />
              )}}
            />

            <Button
              containerStyles="w-full"
              title="Salvar alterações"
              handlePress={form.handleSubmit(submit)}
              isLoading={isLoading}
            />

          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    padding: 4,
    borderWidth: 1,
    borderColor: colors.black[20],
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    shadowColor: 'rgba(0, 0, 0, 0.16)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16, 
    elevation: 4,
    zIndex: 999
  },
});