import { View, Text, TouchableOpacity } from "react-native";
import PostGreenIcon from "@/assets/icons/post-green.svg";
import ReelsGreenIcon from "@/assets/icons/reels-green.svg";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors } from "@/styles/colors";
import { router } from "expo-router";

type MetricsProps = {
  userId: number;
  followers: number;
  following: number;
  memberSince: string;
  socialCount: number;
  reelCount: number;
  averageReview: number;
  onReviewsPress: () => void;
};

export function Metrics({
  userId,
  followers = 0,
  following = 0,
  memberSince = '',
  socialCount = 0,
  reelCount = 0,
  averageReview = 0,
  onReviewsPress = () => {},
}: MetricsProps) {
  return (
    <View className="flex flex-col gap-1 px-6 mt-1">
      <View className="flex flex-row justify-between px-6 py-4">
        <TouchableOpacity className="flex flex-col items-center gap-1" onPress={() => router.push({ pathname: '/followers', params: { id: userId}})}>
          <Text className="text-lg text-white font-medium">{followers}</Text>
          <Text className="text-sm text-brand-grey font-regular">Seguidores</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex flex-col items-center gap-1" onPress={() => router.push({ pathname: '/following', params: { id: userId}})}>
          <Text className="text-lg text-white font-medium">{following}</Text>
          <Text className="text-sm text-brand-grey font-regular">Seguindo</Text>
        </TouchableOpacity>
        <View className="flex flex-col items-center gap-1">
          <Text className="text-lg text-white font-medium">{memberSince}</Text>
          <Text className="text-sm text-brand-grey font-regular">Membro desde</Text>
        </View>
      </View>

      <View className="flex flex-row justify-between bg-black-90 rounded-lg px-6 py-4">
        <View className="flex flex-col items-center">
          <View className="flex flex-row items-center justify-center gap-1">
            <PostGreenIcon width={18} height={18} />
            <Text className="text-lg text-brand-white font-medium">{socialCount}</Text>
          </View>
          <Text className="text-sm text-brand-grey font-regular">Posts</Text>
        </View>

        <View className="flex flex-col items-center">
          <View className="flex flex-row items-center justify-center gap-1">
            <ReelsGreenIcon width={18} height={18} />
            <Text className="text-lg text-brand-white font-medium">{reelCount}</Text>
          </View>
          <Text className="text-sm text-brand-grey font-regular">Weedz</Text>
        </View>

        <TouchableOpacity className="flex flex-col items-center" onPress={onReviewsPress}>
          <View className="flex flex-row items-center justify-center gap-1">
            <Ionicons name="star" size={14} color={colors.brand.green} />
            <Text className="text-lg text-brand-white font-medium">{averageReview}</Text>
          </View>
          <Text className="text-sm text-brand-grey font-regular">Avaliação</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
