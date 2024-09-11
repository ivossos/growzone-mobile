import { Image, Text, TouchableOpacity, View } from "react-native";

interface User {
  id: number;
  avatar: string;
  name: string;
  isFollowing: boolean;
}

interface ContributorCardProps {
  user: User;
}

export default function ContributorCard({ user }: ContributorCardProps) {

  return (
    <View className="flex w-[155px] rounded-2xl border border-black-90">
      <Image height={160} width={155} source={{ uri: user.avatar }} resizeMode="cover" className="rounded-t-2xl" />
      <View className="flex gap-2 p-3">
        <Text className="text-sm text-white font-semibold">{user.name}</Text>
        {user.isFollowing ? 
          <TouchableOpacity className="mr-auto px-3 py-1 bg-black-80 rounded-[64px]">
            <Text className="text-base text-neutral-400">Seguindo</Text>
          </TouchableOpacity>
          : 
          <TouchableOpacity className="mr-auto px-3 py-1 border border-brand-green rounded-[64px]">
            <Text className="text-base text-brand-green">Seguir</Text>
          </TouchableOpacity>
        }
      </View>
    </View>
  );
}
