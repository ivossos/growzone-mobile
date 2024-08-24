import { Text, TouchableOpacity, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ChevronRight, Ellipsis, EllipsisIcon } from "lucide-react-native";
import { Avatar, AvatarImage } from "../Avatar";
import { colors } from "@/styles/colors";
import MediaSlider from "./media-slider";
import LikeIcon from "@/assets/icons/like.svg";
import CommentIcon from "@/assets/icons/comment.svg";
import { useRef, useState } from "react";
import BottomSheet from "@gorhom/bottom-sheet";
import { useCommentContext } from "@/context/comment-context";

interface Post {
  id: number;
  postInfo: PostInfo;
  userInfo: UserInfo;
  media: Media[];
  createdAt: string;
  updatedAt: string;
  subject: string;
  content: string;
  parentPost?: number | null;
  createdBy: number;
}

interface PostInfo {
  liked: boolean;
  likes: number;
  comments: number;
}

interface UserInfo {
  id: number;
  name: string;
  username: string;
  avatar: string | null;
  bio: string | null;
}

export interface Media {
  id: number;
  type: string;
  file?: string | null;
  hls_url?: string | null;
}

interface Props {
  post: Post;
}

export function CardPost({ post }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openBottomSheet } = useCommentContext();

  const handleOpenBottomSheet = () => {
    openBottomSheet(post.id); // Abre o BottomSheet
  };

  

  return (
      <View className="flex gap-6 m-6">
        <View className="flex flex-row items-center justify-between gap-2 w-full">
          <View className="flex flex-row items-center gap-2 ">
            <Avatar className="w-14 h-14 border border-black-90 p-1">
              <AvatarImage
                className="rounded-full"
                source={require("@/assets/images/profile2.png")}
              />
            </Avatar>
            <Text className="text-white text-sm text-center font-semibold">
              Pedro Oliveira
            </Text>
          </View>

          <View className="flex flex-row items-center gap-2">
            <Text className="text-brand-grey text-sm">10h</Text>
            <EllipsisIcon width={20} height={20} color={colors.brand.grey} />
          </View>
        </View>

        <MediaSlider items={post.media} />

        <View className="flex flex-col gap-2">
          <View className="flex flex-row items-center gap-3 mt-2">
            <TouchableOpacity className="flex flex-row items-center gap-1">
              <LikeIcon width={24} height={24} />
              <Text className="text-white font-medium">75</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex flex-row items-center gap-1" onPress={handleOpenBottomSheet}>
              <CommentIcon width={24} height={24} />
              <Text className="text-white font-medium">75</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity className="flex flex-row gap-1">
            <Text className="text-sm text-brand-grey font-medium">
              Curtido por
            </Text>
            <Text className="text-sm text-brand-grey font-bold">
              marceloofc, fabiojunior, ribeiro e outras
            </Text>
          </TouchableOpacity>
        </View>

        <View>
          <Text className="flex-wrap w-full text-start text-ellipsis text-base text-brand-grey font-normal">
            Você conhecia os benefícios da Cannabis para o tratamento de
            Burnout???
          </Text>

          <TouchableOpacity onPress={() => {}}>
            <Text className="text-base text-primary font-semibold">
              {isExpanded ? "ver menos..." : "continuar lendo..."}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex flex-row items-end gap-1 mt-2" onPress={handleOpenBottomSheet}>
            <Text className="text-base text-brand-grey font-semibold">
              Ver todos os 40 comentários
            </Text>
            <ChevronRight width={16} height={16} color={colors.brand.grey} />
          </TouchableOpacity>
        </View>
      </View>
    
  );
}
