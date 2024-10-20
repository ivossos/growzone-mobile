import { View } from "react-native";
import TabProfile from "../tab-profile";

export function TabProfileSection({ userId }: { userId: number }) {
  return (
    <View className="flex flex-col gap-6 px-6 mt-6">
      <TabProfile userId={userId} />
    </View>
  );
}
