import Button from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useAuth } from "@/hooks/use-auth";
import { colors } from "@/styles/colors";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Controller, FieldError, useForm } from "react-hook-form";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { GrowPostDetail, UpdateGrowPost } from "@/api/@types/models";
import { getGrowPost } from "@/api/social/post/get-grow-post";
import SelectGeneticDropdown from "@/components/ui/select-genetic-dropdown";
import SelectPhaseDropdown from "@/components/ui/select-phase-dropdown";
import updateGrowPost from "@/api/social/post/update-grow-post";
import { GrowPostValidation } from "@/components/ui/create-bottom-sheet";
import { queryClient } from "@/lib/react-query";
import Loader from "@/components/ui/loader";
import { debounce } from "lodash";
import { buildErrorMessage } from "@/lib/utils";

interface UpdateGrowPostData {
  postId: number;
  day: string;
  genetic: { id: number | null; label: string | null };
  phase: { id: number | null; label: string | null };
}

export const UpdateGrowPostValidation = z.object({
  postId: z.number(),
  day: z.string().min(1, "Adicione os dias desse cultivo"),
  genetic: z
    .object({
      id: z.number().nullable(),
      label: z.string().nullable(),
    })
    .refine(
      (data) => {
        const isValid = data.id !== null && data.id !== undefined;
        return isValid;
      },
      {
        message: "Selecione uma genética válida",
        path: ["genetic"],
      }
    ),
  phase: z
    .object({
      id: z.number().nullable(),
      label: z.string().nullable(),
    })
    .refine(
      (data) => {
        const isValid = data.id !== null && data.id !== undefined;
        return isValid;
      },
      {
        message: "Selecione uma fase válida",
        path: ["phase"],
      }
    ),
});

export default function EditGrowPost() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFeatch, setIsLoadingFetch] = useState(false);
  const [postDescription, setPostDescription] = useState<string | undefined>(undefined);
  const [post, setPost] = useState<GrowPostDetail>({} as GrowPostDetail);
  const navigation = useNavigation();
  const { user } = useAuth();

  const params = useLocalSearchParams();
  const { id } = (params as unknown as { id: number }) || {};

  const form = useForm<UpdateGrowPostData>({
    resolver: zodResolver(GrowPostValidation),
    values: {
      postId: 0,
      day: "",
      genetic: { id: null, label: null },
      phase: { id: null, label: null },
    },
  });

  const fetchPost = async () => {
    if (!id) return;

    try {
      setIsLoadingFetch(true);
      const data = await getGrowPost(id);

      setPost(data);

      setPostDescription(data.description || '')

      form.setValue("postId", data.post_id);
      form.setValue("day", String(data.day) || "", { shouldValidate: true });
      form.setValue(
        "genetic",
        { id: data.strain?.id || null, label: data.strain.name },
        { shouldValidate: true }
      );
      form.setValue(
        "phase",
        { id: data.phase?.id || null, label: data.phase.name },
        { shouldValidate: true }
      );
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          'Aconteceu um erro ao buscar as informaçōes desse post", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingFetch(false);
    }
  };

  async function submit(values: z.infer<typeof UpdateGrowPostValidation>) { 
    if (!post) return;

    try {
      setIsLoading(true);

      await updateGrowPost({
        post_id: post.id,
        description: postDescription,
        day: Number(values.day),
        strain_id: Number(values.genetic.id),
        phase_id: Number(values.phase.id),
      });

      Toast.show({
        type: "success",
        text1: "Sucesso",
        text2: "Informações atualizadas com sucesso",
      });

      form.reset();

      queryClient.removeQueries({ queryKey: ["timeline"] });
      queryClient.removeQueries({ queryKey: ["grow-post-data"] });

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

  if (isLoadingFeatch) {
    return (
      <View className="flex-1 justify-center items-center bg-black-100">
        <Loader isLoading />
      </View>
    );
  }

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
              <TextInput
                numberOfLines={3}
                multiline
                placeholder="Como está seu cultivo?"
                placeholderTextColor={colors.black[30]}
                selectionColor={colors.brand.green}
                value={postDescription}
                onChangeText={setPostDescription}
                className="text-white text-lg w-full h-60 bg-black-90 border-2 border-black-90 rounded-lg p-2"
              />

              <Controller
                control={form.control}
                name="genetic"
                render={({ field: { onChange, name, value }, fieldState }) => (
                  <SelectGeneticDropdown
                    title="Genética"
                    placeholder="Selecione uma genética"
                    initialValue={{
                      id: Number(value.id) || undefined,
                      label: value.label || undefined,
                    }}
                    handleChangeText={(selectedId, value) => {
                      onChange({ id: Number(selectedId), label: value.label });
                    }}
                    error={buildErrorMessage(name, fieldState.error)}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="phase"
                render={({ field: { onChange, name, value }, fieldState }) => (
                  <SelectPhaseDropdown
                    title="Fase"
                    placeholder="Selecione uma fase"
                    initialValue={{
                      id: Number(value.id) || undefined,
                      label: value.label || undefined,
                    }}
                    handleChangeText={(selectedId, value) => {
                      onChange({ id: Number(selectedId), label: value.label });
                    }}
                    error={buildErrorMessage(name, fieldState.error)}
                  />
                )}
              />

              <Controller
                control={form.control}
                name="day"
                render={({
                  fieldState,
                  field: { onChange, onBlur, value },
                }) => (
                  <FormField
                    title="Dias"
                    placeholder="Ex: 120"
                    keyboardType="numeric"
                    otherStyles="w-full"
                    containerStyles="p-6"
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
