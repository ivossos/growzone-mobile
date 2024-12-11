import Button from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ScrollView, Text, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { GrowPostDetail } from "@/api/@types/models";
import { getGrowPost } from "@/api/social/post/get-grow-post";
import SelectGeneticDropdown from "@/components/ui/select-genetic-dropdown";
import SelectPhaseDropdown from "@/components/ui/select-phase-dropdown";
import updateGrowPost from "@/api/social/post/update-grow-post";
import { GrowPostValidation } from "@/components/ui/create-bottom-sheet";
import { queryClient } from "@/lib/react-query";

export const UpdateGrowPostValidation = z.object({
  description: z.string(),
  day: z.string().min(1, "Adicione os dias desse cultivo"),
  genetic: z.object({
    id: z.number().nullable(),
  }).refine(data => {
    const isValid = data.id !== null && data.id !== undefined;
    return isValid;
  }, {
    message: "Selecione uma genética válida",
    path: ["genetic"],
  }),
  phase: z.object({
    id: z.number().nullable(),
  }).refine(data => {
    const isValid = data.id !== null && data.id !== undefined;
    return isValid;
  }, {
    message: "Selecione uma fase válida",
    path: ["phase"],
  }),
});

export default function EditGrowPost() {
  const [isLoading, setIsLoading] = useState(false);
  const [post, setPost] = useState<GrowPostDetail>();
  const navigation = useNavigation();
  const { user } = useAuth();

  const params = useLocalSearchParams();
  const { id } = (params as unknown  as { id: number }) || {};

  const form = useForm({
    resolver: zodResolver(GrowPostValidation),
    values: {
      description: post?.description || '',
      day: post?.day ? String(post?.day) : '',
      genetic: { id: post?.strain?.id || null },
      phase: { id: post?.phase?.id || null  },
    }
  });

  const fetchPost = async () => {
    if(!id) return;

    try {
      setIsLoading(true);
      const data = await getGrowPost(id);
      setPost(data);

      form.reset({
        description: data.description || '',
        day: String(data.day) || '',
        genetic: { id: data.strain?.id || null },
        phase: { id: data.phase?.id || null },
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.'
      });

    } finally {
      setIsLoading(false);
    }
  };


  async function submit(values: z.infer<typeof UpdateGrowPostValidation>) {
    if(!post) return;

    try {
      setIsLoading(true);
      
      await updateGrowPost({
        post_id: post.id,
        description: values.description,
        day: Number(values.day),
        strain_id: Number(values.genetic.id),
        phase_id: Number(values.phase.id),

      });

      form.reset();
      queryClient.invalidateQueries({ queryKey: ["grow-post-data", post.post_id.toString()] });

      router.back();
      
    } catch (err) {
      console.error('Erro ao atualizar post', err);
      Toast.show({
        type: 'error',
        text1: 'Ops!',
        text2: 'Ocorreu um erro ao atualizar seu post, tente novamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavigation() {
    form.reset();
    navigation.goBack()
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
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
            <TouchableOpacity onPress={handleNavigation}>
              <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
            </TouchableOpacity>
            <Text className="text-white text-base font-semibold">Editar publicação</Text>
          </View>
        
          <View className="flex flex-col gap-6 flex-1 px-6 pb-10 my-3 mb-20">

            <Controller
              control={form.control}
              name="description"
              render={({  fieldState, field: { onChange, onBlur, value } }) => (
                  <FormField
                    title="Descrição"
                    placeholder={`O que você está pensando, ${
                      user.name || user.username
                    }`}
                    onBlur={onBlur}
                    value={value}
                    containerStyles="h-40"
                    style={{
                      flex: 1, borderBottomWidth: 0 
                    }}
                    handleChangeText={onChange}
                    error={fieldState.error?.message}
                    multiline
                    numberOfLines={3}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="genetic"
                render={({ field: { onChange, value }, fieldState }) => (
                  <SelectGeneticDropdown
                    title="Genética"
                    placeholder="Selecione uma genética"
                    initialValue={{ id: post?.strain.id, label: post?.strain.name}}
                    handleChangeText={(selectedId) => onChange({ id: selectedId })}
                    error={fieldState.error?.["id"]?.message}
                  />
                )}
              />

            <Controller
              control={form.control}
              name="phase"
              render={({ field: { onChange, value }, fieldState }) => (
                <SelectPhaseDropdown 
                  title="Fase"
                  placeholder="Selecione uma fase"
                  initialValue={{ id: post?.phase.id, label: post?.phase.name}}
                  handleChangeText={(selectedId) => onChange({ id: selectedId })}
                  error={fieldState.error?.["id"]?.message}
                />
              )}
            />

            <Controller
              control={form.control}
              name="day"
              render={({ fieldState, field: { onChange, onBlur, value } }) => (
                <FormField
                  title="Dias"
                  placeholder="Ex: 120"
                  keyboardType="numeric"
                  otherStyles="w-full"
                  onBlur={onBlur}
                  value={value.toString()}
                  handleChangeText={onChange}
                  error={fieldState.error?.message}
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