import { View, Text, TouchableOpacity } from "react-native";
import VerifiedIcon from "@/assets/icons/verified.svg";
import { Link } from "expo-router";
import { verifyIds } from "@/constants/mock";
import { useState } from "react";

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
  const [isExpanded, setIsExpanded] = useState(false);

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
        <View className="flex flex-col items-start gap-1 w-full">
          <View style={{ flex: 1 }}>
            <Text
              className="text-sm text-white font-medium"
              numberOfLines={isExpanded ? undefined : 3}
              ellipsizeMode="tail"
            >
              {biography}
            </Text>
          </View>
          {biography.split(/\s+/).length > 10 && (
            <TouchableOpacity
              onPress={() => setIsExpanded((prev) => !prev)}
            >
              <Text className="text-sm text-black-60 font-semibold">
                {isExpanded ? "ver menos" : "continuar lendo"}
            </Text>
          </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
