import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Camera } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/Avatar";
import { getInitials } from "@/lib/utils";
import { colors } from "@/styles/colors";

type AvatarSectionProps = {
  imageUri: string | undefined;
  coverUri: string | undefined;
  name: string;
  isLoggerUser: boolean;
  onEditProfile: () => void;
};

export function AvatarSection({
  imageUri,
  coverUri,
  isLoggerUser,
  onEditProfile,
  name
}: AvatarSectionProps) {
  return (
    <View className="relative bg-black-60">
      {coverUri ? (
        <Image source={{ uri: coverUri }} className="w-full h-40" resizeMode="cover" />
      ) : (
        <View className="bg-black-60 w-full h-40" />
      )}

      {isLoggerUser && (
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.11)", "rgba(255, 255, 255, 0.24)"]}
          style={[styles.blurContainer, { top: 20, right: 20 }]}
        >
          <TouchableOpacity onPress={onEditProfile}>
            <Camera size={14} color={colors.brand.white} />
          </TouchableOpacity>
        </LinearGradient>
      )}

      <View className="px-6 absolute -bottom-14">
        <Avatar className="w-28 h-28 border-[4px] border-black-100 bg-black-70">
          {imageUri ? (
            <AvatarImage className="rounded-full" source={{ uri: imageUri }} />
          ) : (
            <AvatarFallback textClassname="text-4xl">{getInitials(name)}</AvatarFallback>
          )}
        </Avatar>
      </View>
    </View>
  );
}

const styles =  StyleSheet.create({
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
