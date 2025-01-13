import Button from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";
import updateSocialPost from "@/api/social/post/update-social-post";
import { getPost } from "@/api/social/post/get-post";
import { PostDetail } from "@/api/@types/models";
import { queryClient } from "@/lib/react-query";

export const EditProfileValidation = z.object({
  description: z.string(),
});

export default function EditPost() {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<PostDetail>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const params = useLocalSearchParams();
  const { id } = (params as unknown as { id: number }) || {};

  const form = useForm({
    resolver: zodResolver(EditProfileValidation),
    values: {
      description: post?.description || "",
    },
  });

  const fetchPost = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await getPost(id);
      setPost(data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  async function submit(values: z.infer<typeof EditProfileValidation>) {
    if (!post) return;
    try {
      setIsLoading(true);

      await updateSocialPost({
        postId: post?.id,
        description: values.description || null,
      });

      form.reset();

      queryClient.removeQueries({ queryKey: ["timeline"] });
      queryClient.removeQueries({ queryKey: ["post-data"] });

      router.back();
    } catch (err) {
      console.error("Erro ao atualizar post", err);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2: "Ocorreu um erro ao atualizar seu post, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavigation() {
    form.reset();
    navigation.goBack();
  }

  useEffect(() => {
    fetchPost();
  }, [id]);

  return (
    <View className="flex-1 bg-black-100">
      <SafeAreaView>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
              <TouchableOpacity onPress={handleNavigation}>
                <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
              </TouchableOpacity>
              <Text className="text-white text-base font-semibold">
                Editar publicação
              </Text>
            </View>

            <View className="flex flex-col gap-6 flex-1 px-6 pb-10 my-3 mb-20">
              <Controller
                control={form.control}
                name="description"
                render={({
                  fieldState,
                  field: { onChange, onBlur, value },
                }) => (
                  <FormField
                    title="Descrição"
                    placeholder={`O que você está pensando, ${
                      user.name || user.username
                    }`}
                    onBlur={onBlur}
                    value={value}
                    containerStyles="h-40"
                    style={{
                      flex: 1,
                      borderBottomWidth: 0,
                    }}
                    handleChangeText={onChange}
                    error={fieldState.error?.message}
                    multiline
                    numberOfLines={3}
                  />
                )}
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
