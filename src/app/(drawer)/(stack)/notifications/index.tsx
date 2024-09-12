import { Avatar, AvatarImage } from "@/components/Avatar";
import { notificationsMock } from "@/constants/mock";
import { colors } from "@/styles/colors";
import { router, useFocusEffect } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import NotificationIcon from "@/assets/icons/notification-green.svg";

const notificationMessages = {
  COMMENT: " comentou seu post",
  LIKE: " curtiu seu post",
  MENTION: " mencionou você",
  FOLLOWING: " seguiu seu perfil",
};

export default function NotificationsScreen() {

  useFocusEffect(() => console.log('entrou'))

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">
            Notificações
          </Text>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="flex flex-col gap-2 py-6 px-6 pb-24">
            {notificationsMock.map((n) => (
              <View key={n.id} className="flex flex-row items-center h-[72px] bg-black-90 px-4 rounded-lg">
                <View className="flex flex-row items-center gap-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      className="rounded-full"
                      src={n?.user_info?.avatar!}
                    />
                  </Avatar>
                  <View className="flex flex-col justify-center gap-2">
                    <Text
                      className="text-white text-sm text-start font-semibold"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {n?.user_info?.name}
                      <Text className="font-regular">
                        {notificationMessages[n.type]}
                      </Text>
                    </Text>
                    <View className="flex flex-row items-center gap-1">
                      <Text className="text-xs text-brand-grey">10 min</Text>
                      <NotificationIcon width={12} heigth={12} />
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
