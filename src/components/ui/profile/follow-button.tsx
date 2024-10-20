import { TouchableOpacity, Text, ActivityIndicator } from "react-native";
import { colors } from "@/styles/colors";

type FollowButtonProps = {
  isFollowing: boolean;
  isLoading: boolean;
  onFollowPress: () => void;
};

export function FollowButton({
  isFollowing,
  isLoading,
  onFollowPress,
}: FollowButtonProps) {
  return (
    <TouchableOpacity
      onPress={onFollowPress}
      className={`flex flex-row items-center justify-center flex-1 gap-2 px-3 py-1 ${
        isFollowing ? "bg-black-80" : "border border-brand-green"
      } rounded-[64px] h-12`}
    >
      {isLoading ? (
        <ActivityIndicator animating={isLoading} color="#fff" size="small" />
      ) : (
        <Text
          className={`text-base ${
            isFollowing ? "text-neutral-400" : "text-brand-green"
          }`}
        >
          {isFollowing ? "Seguindo" : "+ Seguir"}
        </Text>
      )}
    </TouchableOpacity>
  );
}
