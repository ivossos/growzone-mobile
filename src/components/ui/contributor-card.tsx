import { UserDTO } from "@/api/@types/models";
import { createFollow } from "@/api/social/follow/create-follow";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

interface ContributorCardProps {
  user: UserDTO;
}

export default function ContributorCard({ user: contributor }: ContributorCardProps) {
  const { user } = useAuth();
  const [follow, setFollow] = useState<boolean>(contributor.is_following);
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false)

  async function handleFollower() {
    try {
      setIsLoadingHandleFollower(true);
      if (follow) {
        await deleteFollow(contributor.id);
        setFollow(false);
      } else {
        await createFollow(contributor.id)
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
    <Link href={{ pathname: '/profile/[id]', params: { id: contributor.id } }} >
      <View className="flex w-[155px] rounded-2xl border border-black-90">

        <Image height={160} width={155} source={{ uri: contributor.image?.image }} resizeMode="cover" className="rounded-t-2xl" />
        <View className="flex gap-2 p-3">
          <Text className="text-sm text-white font-semibold">{contributor.name}</Text>
          {user.id !== contributor.id ? (
            contributor.is_following ? 
            <TouchableOpacity className="mr-auto px-3 py-1 bg-black-80 rounded-[64px]" onPress={handleFollower}>
              {isLoadingHandleFollower && (
                  <ActivityIndicator
                    animating
                    color="#fff"
                    size="small"
                    className="ml-2"
                  />
                )}
              {!isLoadingHandleFollower && <Text className="text-base text-neutral-400">Seguindo</Text>}
            </TouchableOpacity>
            : 
            <TouchableOpacity className="mr-auto px-3 py-1 border border-brand-green rounded-[64px]">
              {isLoadingHandleFollower && (
                  <ActivityIndicator
                    animating
                    color="#fff"
                    size="small"
                    className="ml-2"
                  />
                )}
              {!isLoadingHandleFollower && <Text className="text-base text-brand-green">Seguir</Text>}
            </TouchableOpacity>
          ) : (<View className="h-7" />)}
        </View>
      </View>
    </Link>
  );
}
