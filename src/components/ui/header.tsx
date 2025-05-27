import { Text, TouchableOpacity, View } from "react-native";
import Logo from "@/assets/icons/logo.svg";
import Coin from "@/assets/icons/coin.svg";
import Bell from "@/assets/icons/bell.svg";
import MenuBurger from "@/assets/icons/menu-burger.svg";
import { useNavigation, useRouter } from "expo-router";
import { DrawerActions } from "@react-navigation/native";
import { useState } from "react";
import { useNotificationContext } from "@/hooks/use-notification";

interface Props {
  scrollToTop?: () => void;
}

export function Header({ scrollToTop = () => {} }: Props) {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const router = useRouter();
  const { notificationCount, clearNotifications } = useNotificationContext();

  const toggleMenu = () => navigation.dispatch(DrawerActions.toggleDrawer());

  const goToNotifications = () => {
    clearNotifications();
    router.push("/notifications");
  };

  return (
    <View className="flex flex-row justify-between items-center h-[72px] px-6 border-b-[1px] border-black-80">
      <TouchableOpacity onPress={scrollToTop}>
        <Logo width={114} height={24} />
      </TouchableOpacity>
      <View className="flex flex-row items-center gap-4">
        {/* <TouchableOpacity activeOpacity={0.7} className="flex flex-row items-center gap-2" onPress={() => router.push('/teste')}>
          <Coin width={24} height={24} />
          <Text className="text-white font-bold text-lg">582</Text>
        </TouchableOpacity> */}
        <TouchableOpacity activeOpacity={0.7} onPress={goToNotifications}>
          {notificationCount > 0 && (
            <View className="flex items-center justify-center absolute z-10 -top-2 -right-2 bg-brand-green rounded-full w-5 h-5">
              <Text className="text-brand-black text-[8px] font-semibold">
                {notificationCount > 9 ? "9+" : notificationCount}
              </Text>
            </View>
          )}
          <Bell width={24} height={24} />
        </TouchableOpacity>
        {/* <TouchableOpacity activeOpacity={0.7} onPress={toggleMenu}>
          <MenuBurger width={24} height={24} />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}
