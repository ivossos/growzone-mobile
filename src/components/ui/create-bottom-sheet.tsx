import React, { useCallback, useState } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Keyboard,
  ScrollView,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { colors } from "@/styles/colors";
import PostIcon from "@/assets/icons/post-green.svg";
import ReelsIcon from "@/assets/icons/reels-green.svg";
import PlantIcon from "@/assets/icons/plant-green.svg";
import QuestionIcon from "@/assets/icons/question.svg";
import PollIcon from "@/assets/icons/poll.svg";
import TopicIcon from "@/assets/icons/topic.svg";
import CommunityIcon from "@/assets/icons/community-green.svg";
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
import { FormField } from "./form-field";
import SelectGeneticDropdown from "./select-genetic-dropdown";
import SelectPhaseDropdown from "./select-phase-dropdown";

export const GrowPostValidation = z.object({
  day: z.string(),
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
})

interface CreateBottomSheetProps {
  onClose: () => void;
}

const CreateBottomSheet = React.forwardRef<BottomSheet, CreateBottomSheetProps>(
  ({ onClose }, ref) => {
    const { user } = useAuth();
    const [isCreatePost, setIsCreatePost] = useState(false);
    const [isCreateReels, setIsCreateReels] = useState(false);
    const [isCreateGrowPost, setIsCreateGrowPost] = useState(false);
    const [snapPoints, setSnapPoints] = useState<string[]>([
      "40%",
      "60%",
      "90%",
    ]);
    const [postDescription, setPostDescription] = useState("");
    const [selectedImages, setSelectedImages] = useState<{uri: string; fileName: string, type: string}[]>([]);
    const [selectedVideos, setSelectedVideos] = useState<{uri: string; fileName: string, type: string}[]>([]);
    const [isLoadingCreatePost, setIsLoadingCreatePost] = useState(false);
    const [isLoadingCreateReels, setIsLoadingCreateReels] = useState(false);
    const [isLoadingCreateGrowPost, setIsLoadingCreateGrowPost] = useState(false);

    const form = useForm({
      resolver: zodResolver(GrowPostValidation),
      defaultValues: {
        day: 10,
        genetic: { id: null },
        phase: { id: null },
      }
    });

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex />
      ),
      []
    );

    const handleSheetChange = useCallback((index: number) => {
      if (index === -1) {
        setSnapPoints(["40%", "60%", "90%"]);
        setIsCreatePost(false);
        setIsCreateReels(false);
        setIsCreateGrowPost(false);
        form.reset();
        setSelectedImages([]);
        setSelectedVideos([]);
        setPostDescription('');
        
      }
    }, []);

    const handleCreatePost = useCallback(() => {
      setIsCreatePost(true);
      if (ref && ref?.current) {
        ref.current.snapToIndex(0);
      }
    }, [ref]);

    const handleCreateReels = useCallback(() => {
      setIsCreateReels(true);
      if (ref && ref?.current) {
        ref.current.snapToIndex(0);
      }
    }, [ref]);

    const handleCreateGrowPost = useCallback(() => {
      setIsCreateGrowPost(true);
      if (ref && ref?.current) {
        ref.current.snapToIndex(0);
      }
    }, [ref]);


    const handleCreateSocialPost = useCallback(async () => {
      if (!selectedImages.length && !selectedVideos.length) {
        return;
      }

      setIsLoadingCreatePost(true);
      try {
        const post = await createSocialPost({
          images: selectedImages,
          video_count: selectedVideos.length,
          description: postDescription,
        });

        for (const video of selectedVideos) {
          try {
            await uploadVideo(post.post_id, video);
          } catch (error) {
            console.error(`Erro ao enviar o vídeo ${video}`, error);
          }
        }
        
        form.reset();
        setSelectedImages([]);
        setSelectedVideos([]);
        setPostDescription('');
        setSnapPoints(["40%", "60%", "90%"]);

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

    const handleCreateSocialGrowPost = useCallback(async (values: z.infer<typeof GrowPostValidation>) => {
      if (!selectedImages.length && !selectedVideos.length) {
        Toast.show({
          type: "info",
          text1: "Ops!",
          text2: "Você precisa adicionar pelo menos uma imagem ou video no seu post",
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
        setPostDescription('');
        setSnapPoints(["40%", "60%", "90%"]);
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
    }, [selectedImages, selectedVideos, postDescription, onClose]);

    
    return (
      <BottomSheet
        ref={ref}
        index={isCreatePost || isCreateReels || isCreateGrowPost ? 0 : -1}
        snapPoints={(isCreatePost || isCreateReels || isCreateGrowPost) ? ["85%"] : snapPoints}
        enablePanDownToClose={!isCreatePost || !isCreateReels || !isCreateGrowPost}
        handleIndicatorStyle={{
          backgroundColor: (isCreatePost || isCreateReels || isCreateGrowPost) ? colors.black[100] : colors.black[70],
        }}
        backgroundStyle={{ backgroundColor: colors.black[100] }}
        backdropComponent={isCreatePost || isCreateReels || isCreateGrowPost ? null : renderBackdrop}
        onChange={handleSheetChange}
      >
        {!isCreatePost && !isCreateReels && !isCreateGrowPost && (
          <BottomSheetView className="flex flex-col flex-1 gap-2 p-6 bg-black-100">
            {[
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
                title: "Weells",
                description: "Crie vídeos curtos e envolventes com Weells",
                onAction: handleCreateReels,
              },
              // { Icon: QuestionIcon, title: 'Pergunta', description: 'Crie perguntas em uma comunidade', onAction: onClose },
              // { Icon: PollIcon, title: 'Enquete', description: 'Crie enquetes em uma comunidade', onAction: onClose },
              // { Icon: TopicIcon, title: 'Tópico', description: 'Inicie uma discussão em uma comunidade', onAction: onClose },
              // { Icon: CommunityIcon, title: 'Comunidade', description: 'Crie sua própria comunidade', onAction: onClose },
            ].map(({ title, description, Icon, onAction }, index) => (
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
            ))}
          </BottomSheetView>
        )}
        {isCreatePost && (
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
                <Text
                  className="text-white text-base text-center font-semibold"
                  onPress={() => Keyboard.dismiss()}
                >
                  {user.name || user.username}
                </Text>
                <TouchableOpacity onPress={() => handleSheetChange(-1)}>
                  <X color={colors.black[70]} size={18} />
                </TouchableOpacity>
              </View>
            </BottomSheetView>
            <BottomSheetView className="flex flex-row flex-1 items-start justify-start">
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
            <BottomSheetView className="flex flex-col gap-6">
              <MediaPicker
                onMediaSelected={(media) => {
                  if (media?.type?.includes('video')) {
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
          </BottomSheetView>
        )}

        {isCreateGrowPost && (
          // <KeyboardAvoidingView
          //   behavior={Platform.OS === "ios" ? "padding" : "height"}
          //   style={{ flex: 1 }}
          // >
          //   <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
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
                      <Text
                        className="text-white text-base text-center font-semibold"
                        onPress={() => Keyboard.dismiss()}
                      >
                        {user.name || user.username}
                      </Text>
                      <TouchableOpacity onPress={() => handleSheetChange(-1)}>
                        <X color={colors.black[70]} size={18} />
                      </TouchableOpacity>
                    </View>
                  </BottomSheetView>

                  <BottomSheetView className="flex flex-row flex-1 items-start justify-start">
                    <TextInput
                      numberOfLines={3}
                      multiline
                      placeholder="Como está seu cultivo"
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
                          if (media?.type?.includes('video')) {
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
                          handleChangeText={(selectedId) => onChange({ id: selectedId })}
                          error={fieldState.error?.['genetic']?.message}
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
                          handleChangeText={(selectedId) => onChange({ id: selectedId })}
                          error={fieldState.error?.['phase']?.message}
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
                      title="Publicar"
                      handlePress={form.handleSubmit(handleCreateSocialGrowPost)}
                      isLoading={isLoadingCreateGrowPost}
                    />
                  </BottomSheetView>
                </BottomSheetView>
              </ScrollView>
          //   </TouchableWithoutFeedback>
          // </KeyboardAvoidingView>
        )}


        {isCreateReels && (
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
                <Text
                  className="text-white text-base text-center font-semibold"
                  onPress={() => Keyboard.dismiss()}
                >
                  {user.name || user.username}
                </Text>
                <TouchableOpacity onPress={() => handleSheetChange(-1)}>
                  <X color={colors.black[70]} size={18} />
                </TouchableOpacity>
              </View>
            </BottomSheetView>
            <BottomSheetView className="flex flex-row flex-1 items-start justify-start">
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
            <BottomSheetView className="flex flex-col gap-6">
              <VideoPicker
                onMediaSelected={(media) => setSelectedVideos((prev) => [...prev, media])}
              />

              <Button
                containerStyles="w-full"
                title="Publicar"
                handlePress={handleCreateSocialReels}
                isLoading={isLoadingCreateReels}
              />
            </BottomSheetView>
          </BottomSheetView>
        )}
      </BottomSheet>
    );
  }
);

export default CreateBottomSheet;
