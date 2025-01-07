import React, {
  MutableRefObject,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Keyboard,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetScrollView,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import PostIcon from "@/assets/icons/post-green.svg";
import ReelsIcon from "@/assets/icons/reels-green.svg";
import PlantIcon from "@/assets/icons/plant-green.svg";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { X } from "lucide-react-native";
import Button from "./button";
import MediaPicker from "./media-picker";
import { useAuth } from "@/hooks/use-auth";
import createSocialPost from "@/api/social/post/create-social-post";
import Toast from "react-native-toast-message";
import { getInitials } from "@/lib/utils";
import VideoPicker from "./video-picker";
import createReels from "@/api/social/post/create-reels";
import { uploadVideo } from "@/api/compress/upload-video";
import { z } from "zod";
import createGrowPost from "@/api/social/post/create-grow-post";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectGeneticDropdown from "./select-genetic-dropdown";
import SelectPhaseDropdown from "./select-phase-dropdown";
import { FormFieldBottomSheetText } from "./form-field-bottom-sheet";
import { MediaUpload, UserSocial } from "@/api/@types/models";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

export const GrowPostValidation = z.object({
  day: z.string().min(1, "Adicione os dias desse cultivo"),
  genetic: z
    .object({
      id: z.number().nullable(),
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

interface CreateBottomSheetProps {
  onClose: () => void;
  handlerCreateBottomSheet: VoidFunction;
}

export interface BottomSheetCustomRef {
  open: VoidFunction;
  close: VoidFunction;
  expand: VoidFunction;
  snapToIndex: (value: number) => void;
}

const BottomSheetContent = ({
  user,
  children,
  title,
  onClose,
}: {
  user: UserSocial;
  children: ReactNode;
  title: string;
  onClose: VoidFunction;
}) => (
  <BottomSheetView className="flex flex-col gap-6 flex-1 px-6 pb-10 mb-20">
    <BottomSheetView className="flex flex-row items-center gap-2">
      <Avatar className="w-10 h-10 bg-black-80">
        {user.image?.image && (
          <AvatarImage
            className="rounded-full"
            source={{ uri: user.image?.image }}
          />
        )}
        <AvatarFallback>
          {getInitials(user?.name || user?.username)}
        </AvatarFallback>
      </Avatar>
      <View className="flex flex-row flex-1 items-center justify-between">
        <Text className="text-white text-base text-center font-semibold">
          {title}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <X color={colors.black[70]} size={24} />
        </TouchableOpacity>
      </View>
    </BottomSheetView>
    {children}
  </BottomSheetView>
);

const CreateBottomSheet = React.forwardRef<
  BottomSheetMethods,
  CreateBottomSheetProps
>(({ onClose, handlerCreateBottomSheet }, ref) => {
  const { user } = useAuth();
  const [currentAction, setCurrentAction] = useState<
    "post" | "reels" | "growPost" | null
  >(null);
  const [postDescription, setPostDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaUpload[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<MediaUpload[]>([]);
  const [isLoadingCreatePost, setIsLoadingCreatePost] = useState(false);
  const [isLoadingCreateReels, setIsLoadingCreateReels] = useState(false);
  const [isLoadingCreateGrowPost, setIsLoadingCreateGrowPost] = useState(false);

  const snapPoints = useMemo(() => ["40%", "60%", "92%"], []);

  const form = useForm({
    resolver: zodResolver(GrowPostValidation),
    defaultValues: {
      day: "10",
      genetic: { id: null },
      phase: { id: null },
    },
  });

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex />
    ),
    []
  );

  const handleSheetChange = useCallback(
    (index: number, closeMainBottonSheet: boolean) => {
      if (index === -1) {
        if (ref && "current" in ref && ref.current && !closeMainBottonSheet) {
          ref.current.snapToIndex(1);
        }

        setCurrentAction(null)
        form.reset();
        setSelectedImages([]);
        setSelectedVideos([]);
        setPostDescription("");
      }
    },
    [form]
  );

  const handleCreatePost = useCallback(() => {
    setCurrentAction('post')
    handlerCreateBottomSheet();
  }, []);

  const handleCreateReels = useCallback(() => {
    setCurrentAction('reels')
    handlerCreateBottomSheet();
  }, []);

  const handleCreateGrowPost = useCallback(() => {
    setCurrentAction('growPost')
    handlerCreateBottomSheet();
  }, []);

  const handleCreateSocialPost = useCallback(async () => {
    if (!selectedImages.length && !selectedVideos.length) {
      return;
    }

    setIsLoadingCreatePost(true);

    const uploadPromises = [];

    try {
      const post = await createSocialPost({
        images: selectedImages,
        video_count: selectedVideos.length,
        description: postDescription,
      });

      for (const video of selectedVideos) {
        const uploadPromise = uploadVideo(post.post_id, video).catch((error) => {
          console.error(`Erro ao enviar o vídeo ${video}`, error);
          return Promise.reject(error);
        });
        uploadPromises.push(uploadPromise);
      }

      await Promise.all(uploadPromises);

      form.reset();
      setCurrentAction(null)
      setSelectedImages([]);
      setSelectedVideos([]);
      setPostDescription("");

      onClose();
    } catch (error) {
      console.error("Erro ao criar post:", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2: "Não foi possivel criar seu post, tente novamente.",
      });
    } finally {
      setIsLoadingCreatePost(false);
    }
  }, [selectedImages, selectedVideos, postDescription, onClose]);

  const handleCreateSocialReels = useCallback(async () => {
    if (!selectedVideos.length) {
      return;
    }

    setIsLoadingCreateReels(true);
    try {
      const reels = await createReels({
        description: postDescription,
      });
      await uploadVideo(reels.post_id, selectedVideos[0]);
      setSelectedVideos([]);
      onClose();
    } catch (error) {
      console.error("Erro ao criar reels:", error);
      Toast.show({
        type: "error",
        text1: "Ops!",
        text2: "Não foi possivel criar seu reels, tente novamente.",
      });
    } finally {
      setIsLoadingCreateReels(false);
    }
  }, [selectedVideos, postDescription, onClose]);

  const handleCreateSocialGrowPost = useCallback(
    async (values: z.infer<typeof GrowPostValidation>) => {
      if (!selectedImages.length && !selectedVideos.length) {
        Toast.show({
          type: "info",
          text1: "Ops!",
          text2:
            "Você precisa adicionar pelo menos uma imagem ou video no seu post",
        });
        return;
      }

      setIsLoadingCreateGrowPost(true);
      try {
        const post = await createGrowPost({
          images: selectedImages,
          video_count: selectedVideos.length,
          description: postDescription,
          day: Number(values.day),
          strain_id: values.genetic.id!,
          phase_id: values.phase.id!,
        });

        for (const video of selectedVideos) {
          try {
            await uploadVideo(post.post_id, video);
          } catch (error) {
            console.error(`Erro ao enviar o vídeo ${video}`, error);
          }
        }

        setSelectedImages([]);
        setSelectedVideos([]);
        form.reset();
        setPostDescription("");
        onClose();
      } catch (error) {
        console.error("Erro ao criar grow post:", error);
        Toast.show({
          type: "error",
          text1: "Ops!",
          text2: "Não foi possivel criar seu post, tente novamente.",
        });
      } finally {
        setIsLoadingCreateGrowPost(false);
      }
    },
    [selectedImages, selectedVideos, postDescription, onClose]
  );

  const onChangeButtonSheet = useCallback(
    (index: number) => {
      const openBottomSheetOption = currentAction !== null && index !== -1;
      
      if (openBottomSheetOption) {
        handlerCreateBottomSheet();
      }

      handleSheetChange(index, currentAction === null);
    },
    [currentAction, handleSheetChange, ref]
  );

  const enablePanDownToClose = useMemo(() => {
    let enablePanDown = true;

    if (currentAction) {
      enablePanDown = false;
    }

    return enablePanDown;
  }, [currentAction]);

  const actionOptions = useMemo(
    () => [
      {
        Icon: PostIcon,
        title: "Post",
        description: "Compartilhe sua jornada na cena",
        onAction: handleCreatePost,
      },
      {
        Icon: PlantIcon,
        title: "Plantas",
        description: "Compartilhe a evolução da sua planta",
        onAction: handleCreateGrowPost,
      },
      {
        Icon: ReelsIcon,
        title: "Weedz",
        description: "Crie vídeos curtos e envolventes com Weedz",
        onAction: handleCreateReels,
      },
    ],
    [handleCreatePost, handleCreateGrowPost, handleCreateReels]
  );

  return (
    <BottomSheet
      ref={ref}
      index={!enablePanDownToClose ? 3 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={{
        backgroundColor: currentAction ? colors.black[100] : colors.black[70],
      }}
      backgroundStyle={{ backgroundColor: colors.black[100] }}
      backdropComponent={renderBackdrop}
      keyboardBlurBehavior="restore"
      enableDynamicSizing
      keyboardBehavior={Platform.OS === "ios" ? "extend" : "extend"}
      onClose={() => {
        onChangeButtonSheet(currentAction ? 0 : -1);
      }}
    >
      {currentAction === null && (
        <BottomSheetView className="flex flex-col flex-1 gap-2 p-6 bg-black-100">
          {actionOptions.map(
            ({ title, description, Icon, onAction }, index) => (
              <TouchableOpacity
                key={index}
                className="flex flex-row items-center gap-2 border border-black-80 rounded-lg p-4"
                onPress={onAction}
              >
                <Icon width={24} height={24} />
                <View>
                  <Text className="text-base font-medium text-brand-white">
                    {title}
                  </Text>
                  <Text className="text-sm font-medium text-brand-grey">
                    {description}
                  </Text>
                </View>
              </TouchableOpacity>
            )
          )}
        </BottomSheetView>
      )}

      {currentAction === "post" && (
        <BottomSheetContent user={user} onClose={() => onChangeButtonSheet(-1)} title="Post">

          <BottomSheetView className="flex flex-row items-start justify-start">
            <TextInput
              numberOfLines={3}
              multiline
              placeholder={`O que você está pensando, ${
                user.name || user.username
              }`}
              placeholderTextColor={colors.black[30]}
              selectionColor={colors.brand.green}
              value={postDescription}
              onChangeText={setPostDescription}
              className="text-white text-lg"
              style={{ flex: 1, borderBottomWidth: 0 }}
            />
          </BottomSheetView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <BottomSheetView className="flex flex-col flex-1 justify-end gap-6">
              <MediaPicker
                onMediaSelected={(media) => {
                  if (media?.type?.includes("video")) {
                    setSelectedVideos((prev) => [...prev, media]);
                  } else {
                    setSelectedImages((prev) => [...prev, media]);
                  }
                }}
              />
              <Button
                containerStyles="w-full"
                title="Publicar"
                handlePress={handleCreateSocialPost}
                isLoading={isLoadingCreatePost}
              />
            </BottomSheetView>
          </TouchableWithoutFeedback>
        </BottomSheetContent>
      )}

      {currentAction === "growPost" && (
        // <KeyboardAvoidingView
        //   behavior={Platform.OS === "ios" ? "padding" : "height"}
        //   style={{ flex: 1 }}
        // >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <BottomSheetScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <BottomSheetContent user={user} onClose={() => onChangeButtonSheet(-1)} title="Plantas">
              <BottomSheetView className="flex flex-row flex-1 items-start justify-start">
                <TextInput
                  numberOfLines={3}
                  multiline
                  placeholder="Como está seu cultivo?"
                  placeholderTextColor={colors.black[30]}
                  selectionColor={colors.brand.green}
                  value={postDescription}
                  onChangeText={setPostDescription}
                  className="text-white text-lg"
                  style={{ flex: 1, borderBottomWidth: 0 }}
                />
              </BottomSheetView>

              <BottomSheetView className="flex flex-col gap-6">
                <MediaPicker
                  onMediaSelected={(media) => {
                    if (media?.type?.includes("video")) {
                      setSelectedVideos((prev) => [...prev, media]);
                    } else {
                      setSelectedImages((prev) => [...prev, media]);
                    }
                  }}
                />

                <Controller
                  control={form.control}
                  name="genetic"
                  render={({ field: { onChange, value }, fieldState }) => (
                    <SelectGeneticDropdown
                      title="Genética"
                      placeholder="Selecione uma genética"
                      handleChangeText={(selectedId) =>
                        onChange({ id: selectedId })
                      }
                      error={fieldState.error?.["genetic"]?.message}
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
                      handleChangeText={(selectedId) =>
                        onChange({ id: selectedId })
                      }
                      error={fieldState.error?.["phase"]?.message}
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
                    <FormFieldBottomSheetText
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
                  title="Publicar"
                  handlePress={form.handleSubmit(handleCreateSocialGrowPost)}
                  isLoading={isLoadingCreateGrowPost}
                />
              </BottomSheetView>
            </BottomSheetContent>
          </BottomSheetScrollView>
        </TouchableWithoutFeedback>
        //  </KeyboardAvoidingView>
      )}

      {currentAction === "reels" && (
        <BottomSheetContent user={user} onClose={() => onChangeButtonSheet(-1)} title="Weedz">
          <BottomSheetView className="flex flex-row items-start justify-start">
            <TextInput
              numberOfLines={3}
              multiline
              placeholder={`O que você está pensando, ${
                user.name || user.username
              }`}
              placeholderTextColor={colors.black[30]}
              selectionColor={colors.brand.green}
              value={postDescription}
              onChangeText={setPostDescription}
              className="text-white text-lg"
              style={{ flex: 1, borderBottomWidth: 0 }}
            />
          </BottomSheetView>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <BottomSheetView className="flex flex-col flex-1 justify-end gap-6">
              <VideoPicker
                onMediaSelected={(media) =>
                  setSelectedVideos((prev) => [...prev, media])
                }
              />

              <Button
                containerStyles="w-full"
                title="Publicar"
                handlePress={handleCreateSocialReels}
                isLoading={isLoadingCreateReels}
              />
            </BottomSheetView>
          </TouchableWithoutFeedback>
        </BottomSheetContent>
      )}
    </BottomSheet>
  );
});

export default CreateBottomSheet;
