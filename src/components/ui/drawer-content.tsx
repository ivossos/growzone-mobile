import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";
import { ChevronLeft } from "lucide-react-native";
import { colors } from "@/styles/colors";

import LogoIcon from "@/assets/icons/logo.svg";
import GearIcon from "@/assets/icons/gear.svg";
import VerifiedIcon from "@/assets/icons/verified.svg";
import { DrawerButton } from "./drawer-button";
import { CustomOptions } from "@/@types/navigation";
import { router } from "expo-router";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import { verifyIds } from "@/constants/mock";

export function DrawerContent({ navigation, ...props }: DrawerContentComponentProps) {
  const { user } = useAuth();

  const toggleMenu = () => navigation.toggleDrawer();

  return (
    <View className="flex-1 bg-black-100">
      <SafeAreaView className="flex-1">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 42,
          }}
        >

          <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
            <TouchableOpacity
              className="p-2 rounded-lg border border-black-80"
              onPress={toggleMenu}
            >
              <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
            </TouchableOpacity>
            <LogoIcon width={114} height={24} />
          </View>

          <View className="flex flex-col gap-6 p-6 pb-8">
            <View className="flex flex-row items-center gap-2">
              <GearIcon width={24} height={24} />
              <Text className="text-white text-lg font-semibold">
                Configurações
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/profile/[id]",
                  params: { id: user.id },
                })
              }
              className="flex flex-row items-center gap-2 p-4 rounded-lg bg-black-90"
            >
              <Avatar className="w-12 h-12 bg-black-100">
                {user?.image && (
                  <AvatarImage
                    className="rounded-full"
                    source={{ uri: user.image.image }}
                  />
                )}
                <AvatarFallback>
                  {getInitials(user?.name || user.username)}
                </AvatarFallback>
              </Avatar>
              <View className="flex flex-row items-center gap-1">
                <Text className="text-white text-base font-semibold">
                  {user?.name || user.username}
                </Text>
                {verifyIds.includes(user.username) && (
                  <VerifiedIcon width={18} height={18} />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {props.state.routes.map((route, index) => {
            const options = props.descriptors[route.key]
              .options as CustomOptions;

            if (options.title === undefined) return null;

            const onPress = () => {
              const event = navigation.emit({
                type: "drawerItemPress",
                canPreventDefault: true,
                target: route.key,
              });

              if (!event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <View key={route.key} className="w-full">
                <DrawerButton
                  title={options.title}
                  Icon={options.iconName}
                  isDivider={options.isDivider}
                  onPress={onPress}
                />
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
