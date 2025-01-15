import { UserDTO } from "@/api/@types/models";
import { createFollow } from "@/api/social/follow/create-follow";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { useAuth } from "@/hooks/use-auth";
import { Link, router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { getInitials } from "@/lib/utils";

interface ContributorCardProps {
  user: UserDTO;
}

export default function ContributorCard({
  user: contributor,
}: ContributorCardProps) {
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = screenWidth * 0.42;

  const { user } = useAuth();

  const [follow, setFollow] = useState<boolean>(contributor.is_following);
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false);

  async function handleFollower() {
    try {
      setIsLoadingHandleFollower(true);
      if (follow) {
        await deleteFollow(contributor.id);
        setFollow(false);
      } else {
        await createFollow(contributor.id);
        setFollow(true);
      }
    } catch (error) {
      console.error("erro on handleFollower", error);

      Toast.show({
        type: "error",
        text1: "Opss",
        text2:
          'Aconteceu um erro realizar essa açåo", "Tente novamente mais tarde.',
      });
    } finally {
      setIsLoadingHandleFollower(false);
    }
  }

  return (
    <View
      className="bg-black-100 border border-black-90 rounded-lg shadow-lg gap-4"
      style={{ width: cardWidth }}
    >
      {contributor.image?.image ? (
        <Image
          source={{ uri: contributor.image?.image }}
          className="h-40 rounded-lg"
          resizeMode="cover"
          alt="Image user"
        />
      ) : (
        <View className="flex flex-row justify-center items-center bg-black-80 rounded-lg h-40">
          <Text className="text-brand-green text-center text-7xl">
            {getInitials(contributor?.name || contributor?.username)}
          </Text>
        </View>
      )}

      <View className="px-4 gap-4">
        <Text className="text-sm text-white font-semibold">
          {contributor.name || contributor?.username}
        </Text>

        {user.id === contributor.id ? (
          <TouchableOpacity
            className="mr-auto px-3 py-1 bg-black-80 rounded-full"
            onPress={() =>
              router.push({
                pathname: "/profile/[id]",
                params: { id: contributor.id },
              })
            }
          >
            <Text className="text-base text-brand-green">Entrar</Text>
          </TouchableOpacity>
        ) : follow ? (
          <TouchableOpacity
            className="mr-auto px-3 py-1 bg-black-80 rounded-full"
            onPress={handleFollower}
          >
            {isLoadingHandleFollower ? (
              <ActivityIndicator
                animating
                color="#fff"
                size="small"
                className="ml-2"
              />
            ) : (
              <Text className="text-base text-neutral-400">Seguindo</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            className="mr-auto px-3 py-1 border border-brand-green rounded-full"
            onPress={handleFollower}
          >
            {isLoadingHandleFollower ? (
              <ActivityIndicator
                animating
                color="#fff"
                size="small"
                className="ml-2"
              />
            ) : (
              <Text className="text-base text-brand-green">Seguir</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
