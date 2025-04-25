import {
  Image,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import VerifiedIcon from "@/assets/icons/verified.svg";
import PostGreenIcon from "@/assets/icons/post-green.svg";
import ReelsGreenIcon from "@/assets/icons/reels-green.svg";
import { colors } from "@/styles/colors";
import TabProfile from "../ui/tab-profile";
import { Camera, ChevronLeft, Ellipsis } from "lucide-react-native";
import LogoIcon from "@/assets/icons/logo-small.svg";
import { router } from "expo-router";
import { formatDateToMonthYear, getInitials } from "@/lib/utils";
import { Follow, UserProfile } from "@/api/@types/models";
import { createFollow } from "@/api/social/follow/create-follow";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import Toast from "react-native-toast-message";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/use-auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";

type ProfileDetailsProps = {
  userId: number;
  profile: UserProfile;
  isLoggerUser: boolean;
  isFollow?: Follow;
  onUpdateProfile: () => Promise<void>;
};

export default function ProfileDetails({
  userId,
  profile,
  isLoggerUser,
  isFollow,
  onUpdateProfile,
}: ProfileDetailsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [follow, setFollow] = useState<Follow | undefined>(isFollow);
  const { openBottomSheet } = useBottomSheetContext();

  const { cover, image, info, metric } = profile;

  const handleOpenRateProfileBottomSheet = () => {
    openBottomSheet({
      type: "rate-profile",
      userId: profile.info.id,
      callbackFn: onUpdateProfile,
    });
  };

  const handleOpenReviewsProfileBottomSheet = () => {
    openBottomSheet({ type: "reviews-profile", userId: profile.info.id });
  };

  async function handleFollower() {
    try {
      setIsLoading(true);
      if (follow && follow.is_active) {
        await deleteFollow(info.id);
        setFollow(undefined);
      } else {
        setFollow(await createFollow(info.id));
      }

      await onUpdateProfile();
    } catch (error) {
      console.error("erro on handleFollower", error);

      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          'Aconteceu um erro realizar essa açåo", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  function handleNavigation() {
    router.push({ pathname: "/edit-profile" });
  }

  useEffect(() => {
    setFollow(isFollow);
  }, [isFollow]);

  return (
    <View className="flex flex-1 bg-black-100">
      <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
        <TouchableOpacity
          className="p-2 rounded-lg border border-black-80"
          onPress={() => router.push(`/profile?id=${userId}`)}
        >
          <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
        </TouchableOpacity>
        <LogoIcon width={102} heigth={11} />
      </View>

      <ScrollView
        className="flex flex-1 bg-black-100"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }} className="h-auto">
          <View className="relative bg-black-60">
            {cover?.cover ? (
              <Image
                source={{ uri: profile.cover.cover }}
                className="w-full h-40"
                resizeMode="cover"
              />
            ) : (
              <View className="bg-black-60 w-full h-40" />
            )}
            {isLoggerUser && (
              <LinearGradient
                colors={[
                  "rgba(255, 255, 255, 0.11)",
                  "rgba(255, 255, 255, 0.24)",
                ]}
                style={[styles.blurContainer, { top: 20, right: 20 }]}
              >
                <TouchableOpacity className="" onPress={handleNavigation}>
                  <Camera size={14} color={colors.brand.white} />
                </TouchableOpacity>
              </LinearGradient>
            )}
            <View className="px-6 absolute -bottom-14">
              <Avatar className="w-28 h-28 border-[4px] border-black-100 bg-black-70">
                {image?.image && (
                  <AvatarImage
                    className="rounded-full"
                    source={{ uri: image.image }}
                  />
                )}
                <AvatarFallback textClassname="text-4xl">
                  {getInitials(info?.name || info?.username)}
                </AvatarFallback>
              </Avatar>
            </View>
          </View>
          <View className="flex flex-col gap-4 px-6 mt-20">
            <View className="flex flex-row items-center gap-1">
              <Text className="text-2xl text-white font-semibold">
                {info?.name || info?.username}
              </Text>
              <VerifiedIcon width={18} heigth={18} />
            </View>
            {info?.biography && (
              <View className="flex flex-row items-center gap-1 w-full">
                <Text className="text-base text-white font-medium">
                  {info?.biography}
                </Text>
              </View>
            )}
          </View>
          <View className="flex flex-col gap-1 px-6 mt-6">
            <View className="flex flex-row justify-between px-6 py-4">
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/[id]/followers",
                    params: { id: profile.info.id },
                  })
                }
                className="flex flex-col items-center gap-1"
              >
                <Text className="text-lg text-white font-medium">
                  {metric.followers}
                </Text>
                <Text className="text-sm text-brand-grey font-regular">
                  Seguidores
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/[id]/following",
                    params: { id: profile.info.id },
                  })
                }
                className="flex flex-col items-center gap-1"
              >
                <Text className="text-lg text-white font-medium">
                  {metric.following}
                </Text>
                <Text className="text-sm text-brand-grey font-regular">
                  Seguindo
                </Text>
              </TouchableOpacity>
              <View className="flex flex-col items-center gap-1">
                <Text className="text-lg text-white font-medium">
                  {formatDateToMonthYear(info.created_at)}
                </Text>
                <Text className="text-sm text-brand-grey font-regular">
                  Membro desde
                </Text>
              </View>
            </View>
            <View className="flex flex-row justify-between bg-black-90 rounded-lg px-6 py-4">
              <View className="flex flex-col items-center ">
                <View className="flex flex-row items-center justify-center gap-1">
                  <PostGreenIcon width={18} heigth={18} />
                  <Text className="text-lg text-brand-white font-medium">
                    {metric.social_count}
                  </Text>
                </View>
                <Text className="text-sm text-brand-grey font-regular">
                  Posts
                </Text>
              </View>
              <View className="flex flex-col items-center gap-1">
                <View className="flex flex-row items-center justify-center gap-1">
                  <ReelsGreenIcon width={18} heigth={18} />
                  <Text className="text-lg text-brand-white font-medium">
                    {metric.reel_count}
                  </Text>
                </View>
                <Text className="text-sm text-brand-grey font-regular">
                  Weedz
                </Text>
              </View>
              <TouchableOpacity
                className="flex flex-col items-center gap-1"
                onPress={handleOpenReviewsProfileBottomSheet}
              >
                <View className="flex flex-row items-center justify-center gap-1">
                  <Ionicons name="star" size={14} color={colors.brand.green} />
                  <Text className="text-lg text-brand-white font-medium">
                    {metric.average_review}
                  </Text>
                </View>
                <Text className="text-sm text-brand-grey font-regular">
                  Avaliação 123
                </Text>
              </TouchableOpacity>
            </View>

            {!isLoggerUser && (
              <View className="flex flex-row gap-2 mt-6">
                {!!follow ? (
                  <TouchableOpacity
                    onPress={handleFollower}
                    className="flex flex-row items-center justify-center flex-1 gap-2 px-3 py-1 bg-black-80 rounded-[64px] h-12 "
                  >
                    {isLoading && (
                      <ActivityIndicator
                        animating={isLoading}
                        color="#fff"
                        size="small"
                        className="ml-2"
                      />
                    )}
                    <Text className="text-lg text-neutral-400 text-center">
                      Seguindo
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleFollower}
                    className="flex flex-row items-center justify-center flex-1 gap-2 px-3 py-1 border border-brand-green rounded-[64px] h-12"
                  >
                    {isLoading && (
                      <ActivityIndicator
                        animating={isLoading}
                        color="#fff"
                        size="small"
                        className="ml-2"
                      />
                    )}
                    <Text className="text-base text-brand-green ">
                      + Seguir
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={handleOpenRateProfileBottomSheet}
                  className="flex items-center justify-center p-1 border border-black-70 rounded-full h-12 w-12"
                >
                  <Ellipsis size={16} color={colors.black[70]} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <View className="mt-8 h-full">
          <TabProfile userId={userId} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    position: "absolute",
    padding: 4,
    borderWidth: 1,
    borderColor: colors.black[20],
    borderRadius: 9999,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    shadowColor: "rgba(0, 0, 0, 0.16)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 4,
    zIndex: 999,
  },
});
