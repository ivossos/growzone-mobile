import { Text, TouchableOpacity, View } from "react-native";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { getInitials } from "@/lib/utils";
import { useState } from "react";
import { deleteFollow } from "@/api/social/follow/delete-follow";
import { createFollow } from "@/api/social/follow/create-follow";
import Toast from "react-native-toast-message";
import { PostLike, UserDTO } from "@/api/@types/models";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "expo-router";

const UserItemCard = ({ item }: { item: UserDTO}) => {
  const { user } = useAuth();
  const [isLoadingHandleFollower, setIsLoadingHandleFollower] = useState(false)
  const [follow, setFollow] = useState<boolean>(item.is_following);
  
  async function handleFollower() {
    try {
      setIsLoadingHandleFollower(true);
      if (follow) {
        await deleteFollow(item.id);
        setFollow(false);
      } else {
        await createFollow(item.id)
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
  <View key={item.id} className="flex flex-row items-center justify-between w-full">
    <Link href={{ pathname: '/profile/[id]', params: { id: item.id} }}>
      <View className="flex flex-row items-center gap-2">
        <Avatar className="w-12 h-12 bg-black-80">
          {item?.image?.image && (
            <AvatarImage
              className="rounded-full"
              source={{ uri: item.image.image }}
            />
          )}
          <AvatarFallback>
            {getInitials(item?.name || item?.username)}
          </AvatarFallback>
        </Avatar>
        <View>
          <Text className="text-white text-lg text-start font-semibold">
            {item?.name || item.username}
          </Text>
        {item?.name && <Text className="text-brand-grey text-sm text-start font-regular">
            {item?.username}
          </Text>}
        </View>
      </View>
    </Link>

    {user.id!== item.id && (
      follow ? (
        <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px]" onPress={handleFollower}>
          <Text className="text-base text-neutral-400">Seguindo</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity className="px-3 py-1 border border-brand-green rounded-[64px]" onPress={handleFollower}>
          <Text className="text-base text-brand-green ">+ Seguir</Text>
        </TouchableOpacity>
      )
    )}
  </View>
)};

export default UserItemCard;