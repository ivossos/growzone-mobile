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
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
} from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFooter,
  BottomSheetFooterProps,
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
import { buildErrorMessage, getInitials } from "@/lib/utils";
import VideoPicker from "./video-picker";
import createReels from "@/api/social/post/create-reels";
import { z } from "zod";
import createGrowPost from "@/api/social/post/create-grow-post";
import { Controller, FieldError, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import SelectGeneticDropdown from "./select-genetic-dropdown";
import SelectPhaseDropdown from "./select-phase-dropdown";
import { FormFieldBottomSheetText } from "./form-field-bottom-sheet";
import { MediaUpload, UserSocial } from "@/api/@types/models";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { useVideoPlayerContext } from "@/context/video-player-context";
import { PostType } from "@/api/@types/enums";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreatePostProgress } from "@/hooks/use-create-post-progress";

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
  styleScroll,
  onClose,
}: {
  user: UserSocial;
  children: ReactNode;
  title: string;
  styleScroll: StyleProp<ViewStyle>;
  onClose: VoidFunction;
}) => (
  <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
      <ScrollView
        contentContainerStyle={styleScroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </BottomSheetView>
  </TouchableWithoutFeedback>
);

const CreateBottomSheet = React.forwardRef<
  BottomSheetMethods,
  CreateBottomSheetProps
>(({ onClose, handlerCreateBottomSheet }, ref) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { createSocialPost, createReelsPost, createGrowPost } =
    useCreatePostProgress();
  const { pauseVideo, setPlayer } = useVideoPlayerContext();
  const [currentAction, setCurrentAction] = useState<PostType | null>(null);
  const [postDescription, setPostDescription] = useState("");
  const [selectedImages, setSelectedImages] = useState<MediaUpload[]>([]);
  const [selectedVideos, setSelectedVideos] = useState<MediaUpload[]>([]);
  const [isLoadingCreatePost, setIsLoadingCreatePost] = useState(false);
  const [isLoadingCreateReels, setIsLoadingCreateReels] = useState(false);
  const [isLoadingCreateGrowPost, setIsLoadingCreateGrowPost] = useState(false);

  const snapPoints = useMemo(() => ["40%", "60%", "90%"], []);

  const form = useForm({
    resolver: zodResolver(GrowPostValidation),
    defaultValues: {
      day: "10",
      genetic: { id: null },
      phase: { id: null },
    },
  });

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} opacity={0.8} appearsOnIndex={1} />
    ),
    []
  );

  const handleSheetChange = useCallback(
    (index: number, closeMainBottonSheet: boolean) => {
      if (index === -1) {
        if (ref && "current" in ref && ref.current && !closeMainBottonSheet) {
          ref.current.snapToIndex(1);
        }

        setCurrentAction(null);
        form.reset();
        setSelectedImages([]);
        setSelectedVideos([]);
        setPostDescription("");
      }
    },
    [form]
  );

  const handleCreatePost = useCallback(() => {
    setCurrentAction(PostType.SOCIAL_POST);
    setTimeout(() => {
      handlerCreateBottomSheet();
    }, 50);
  }, []);

  const handleCreateReels = useCallback(() => {
    setCurrentAction(PostType.WEEDZ_POST);
    handlerCreateBottomSheet();
  }, []);

  const handleCreateGrowPost = useCallback(() => {
    setCurrentAction(PostType.GROW_POST);
    handlerCreateBottomSheet();
  }, []);

  const handleCreateSocialPost = useCallback(async () => {
    if (!selectedImages.length && !selectedVideos.length) {
      return;
    }

    setIsLoadingCreatePost(true);

    try {
      createSocialPost({
        userId: user.id,
        images: selectedImages,
        videos: selectedVideos,
        description: postDescription,
      });

      form.reset();
      setCurrentAction(null);
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
      createReelsPost({
        userId: user.id,
        description: postDescription,
        video: selectedVideos[0],
      });

      setSelectedVideos([]);
      pauseVideo();
      setPlayer(undefined);
      setCurrentAction(null);
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

  const handleCreateSocialGrowPost = async (
    values: z.infer<typeof GrowPostValidation>
  ) => {
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
      createGrowPost({
        userId: user.id,
        images: selectedImages,
        videos: selectedVideos,
        description: postDescription,
        day: Number(values.day),
        strain_id: values.genetic.id!,
        phase_id: values.phase.id!,
      });

      setCurrentAction(null);
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
  };

  const truncatePlaceholder = useCallback(
    (text: string, maxLength: number = 50) => {
      return text.length > maxLength
        ? text.slice(0, maxLength).concat("...")
        : text;
    },
    []
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

  const footerComponent = useCallback(
    (props: BottomSheetFooterProps) => {
      const buttonFooter = {
        [PostType.SOCIAL_POST]: (
          <BottomSheetFooter
            style={{
              paddingBottom: insets.bottom,
              paddingHorizontal: 8,
              backgroundColor: colors.black[100],
            }}
            {...props}
          >
            <Button
              containerStyles="w-full"
              title="Publicar"
              handlePress={handleCreateSocialPost}
              isLoading={isLoadingCreatePost}
            />
          </BottomSheetFooter>
        ),
        [PostType.WEEDZ_POST]: (
          <BottomSheetFooter
            style={{
              paddingBottom: insets.bottom,
              paddingHorizontal: 8,
              backgroundColor: colors.black[100],
            }}
            {...props}
          >
            <Button
              containerStyles="w-full"
              title="Publicar"
              handlePress={handleCreateSocialReels}
              isLoading={isLoadingCreateReels}
            />
          </BottomSheetFooter>
        ),
        [PostType.GROW_POST]: (
          <BottomSheetFooter
            style={{
              paddingBottom: insets.bottom,
              paddingHorizontal: 8,
              backgroundColor: colors.black[100],
            }}
            {...props}
          >
            <Button
              containerStyles="w-full"
              title="Publicar"
              handlePress={form.handleSubmit(handleCreateSocialGrowPost)}
              isLoading={isLoadingCreateGrowPost}
            />
          </BottomSheetFooter>
        ),
      };

      return buttonFooter[currentAction as PostType] || undefined;
    },
    [
      currentAction,
      isLoadingCreatePost,
      isLoadingCreateReels,
      form,
      isLoadingCreateGrowPost,
      handleCreateSocialGrowPost,
      handleCreateSocialPost,
      handleCreateSocialReels,
    ]
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
        description: "Crie vídeos curtos e envolventes",
        onAction: handleCreateReels,
      },
    ],
    [handleCreatePost, handleCreateGrowPost, handleCreateReels]
  );

  return (
    <BottomSheet
      ref={ref}
      index={!enablePanDownToClose ? 2 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose={enablePanDownToClose}
      handleIndicatorStyle={{
        backgroundColor: currentAction ? colors.black[100] : colors.black[70],
      }}
      backgroundStyle={{ backgroundColor: colors.black[100] }}
      backdropComponent={renderBackdrop}
      keyboardBlurBehavior="restore"
      enableDynamicSizing
      keyboardBehavior="extend"
      onClose={() => {
        onChangeButtonSheet(currentAction ? 0 : -1);
      }}
      footerComponent={footerComponent}
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

      {currentAction === PostType.SOCIAL_POST && (
        <BottomSheetContent
          user={user}
          onClose={() => onChangeButtonSheet(-1)}
          title="Post"
          styleScroll={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingBottom: 20,
          }}
        >
          <View style={{ width: "100%", maxHeight: 300 }}>
            <TextInput
              numberOfLines={3}
              multiline
              placeholder={`O que você está pensando, ${truncatePlaceholder(
                user.name || user.username,
                15
              )}`}
              placeholderTextColor={colors.black[30]}
              selectionColor={colors.brand.green}
              value={postDescription}
              onChangeText={setPostDescription}
              className="text-white text-lg w-full h-full bg-black-90 border-2 border-black-90 rounded-lg p-2"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <MediaPicker
              onMediaSelected={(media) => {
                if (media?.type?.includes("video")) {
                  setSelectedVideos((prev) => [...prev, media]);
                } else {
                  setSelectedImages((prev) => [...prev, media]);
                }
              }}
            />
          </View>
        </BottomSheetContent>
      )}

      {currentAction === PostType.GROW_POST && (
        <BottomSheetContent
          user={user}
          onClose={() => onChangeButtonSheet(-1)}
          title="Plantas"
          styleScroll={{
            flex: 1,
            paddingBottom: 20,
          }}
        >
          <BottomSheetView className="flex flex-1 items-start max-h-[300px]">
            <TextInput
              numberOfLines={3}
              multiline
              placeholder="Como está seu cultivo?"
              placeholderTextColor={colors.black[30]}
              selectionColor={colors.brand.green}
              value={postDescription}
              onChangeText={setPostDescription}
              className="text-white text-lg w-full h-full bg-black-90 border-2 border-black-90 rounded-lg p-2"
              style={{ textAlignVertical: "top" }}
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
              render={({ field: { onChange, name }, fieldState }) => (
                <SelectGeneticDropdown
                  title="Genética"
                  placeholder="Selecione uma genética"
                  handleChangeText={(selectedId) => {
                    onChange({ id: Number(selectedId) });
                  }}
                  error={buildErrorMessage(name, fieldState.error)}
                />
              )}
            />

            <Controller
              control={form.control}
              name="phase"
              render={({ field: { onChange, name }, fieldState }) => (
                <SelectPhaseDropdown
                  title="Fase"
                  placeholder="Selecione uma fase"
                  openDirection="up"
                  handleChangeText={(selectedId) =>
                    onChange({ id: selectedId })
                  }
                  error={buildErrorMessage(name, fieldState.error)}
                />
              )}
            />

            <Controller
              control={form.control}
              name="day"
              render={({
                fieldState,
                field: { onChange, onBlur, value, name },
              }) => (
                <FormFieldBottomSheetText
                  title="Dias"
                  placeholder="Ex: 120"
                  keyboardType="numeric"
                  otherStyles="w-full"
                  containerStyles="p-6"
                  onBlur={onBlur}
                  value={value.toString()}
                  handleChangeText={onChange}
                  error={buildErrorMessage(name, fieldState.error)}
                />
              )}
            />
          </BottomSheetView>
        </BottomSheetContent>
      )}

      {currentAction === PostType.WEEDZ_POST && (
        <BottomSheetContent
          user={user}
          onClose={() => onChangeButtonSheet(-1)}
          title="Weedz"
          styleScroll={{
            flexGrow: 1,
            justifyContent: "space-between",
            paddingBottom: 20,
          }}
        >
          <View style={{ width: "100%", maxHeight: 300 }}>
            <TextInput
              numberOfLines={3}
              multiline
              placeholder={`O que você está pensando, ${truncatePlaceholder(
                user.name || user.username,
                15
              )}`}
              placeholderTextColor={colors.black[30]}
              selectionColor={colors.brand.green}
              value={postDescription}
              onChangeText={setPostDescription}
              className="text-white text-lg w-full h-full bg-black-90 border-2 border-black-90 rounded-lg p-2"
              style={{ textAlignVertical: "top" }}
            />
          </View>

          <View style={{ marginTop: 40 }}>
            <VideoPicker
              onMediaSelected={(media) =>
                setSelectedVideos((prev) => [...prev, media])
              }
            />
          </View>
        </BottomSheetContent>
      )}
    </BottomSheet>
  );
});

export default CreateBottomSheet;

const styles = StyleSheet.create({
  scrollConteiner: {
    flex: 1,
  },
});
