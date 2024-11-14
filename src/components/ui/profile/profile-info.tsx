import { View, Text } from "react-native";
import VerifiedIcon from "@/assets/icons/verified.svg";
import { Link } from "expo-router";
import { verifyIds } from "@/constants/mock";

type ProfileInfoProps = {
  name?: string;
  username: string;
  biography?: string;
  category?: {
    id: number;
    name: string;
  }
};

export function ProfileInfo({ name = '', username = '', biography = '', category}: ProfileInfoProps) {
  return (
    <View className="flex flex-col gap-1 px-6 mt-20">
        <View className="flex flex-row items-center gap-1">
          <Text className="text-2xl text-white font-semibold">{name || username}</Text>
          {verifyIds.includes(username) && <VerifiedIcon width={18} height={18} />}
        </View>
        {category && <Link href={{ pathname: '/category-list/[name]', params: { name: category.name } }} >
          <Text className="text-base text-brand-green">{category.name}</Text>
        </Link>}
        {!category && <Text className="text-base text-brand-green"></Text>}
      {biography && (
        <View className="flex flex-row items-center gap-1 w-full">
          <Text className="text-base text-white font-medium">{biography}</Text>
        </View>
      )}
    </View>
  );
}
