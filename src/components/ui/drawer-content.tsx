import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { Avatar, AvatarImage } from "../Avatar";
import { ChevronLeft } from "lucide-react-native";
import { colors } from "@/styles/colors";

import LogoIcon from "@/assets/icons/logo-small.svg";
import GearIcon from "@/assets/icons/gear.svg";
import VerifiedIcon from "@/assets/icons/verified.svg";
import { DrawerButton } from "./drawer-button";
import { CustomOptions } from "@/@types/navigation";
import { useNavigation } from "expo-router";
import { DrawerActions } from "@react-navigation/native";

export function DrawerContent( props: DrawerContentComponentProps) {
  const navigation = useNavigation();
  const toggleMenu = () => navigation.dispatch(DrawerActions.toggleDrawer());

  return (
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={toggleMenu}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} heigth={11} />
        </View>


        <View className="flex flex-col gap-6 p-6 pb-8">
          <View className="flex flex-row items-center gap-2">
            <GearIcon width={24} heigth={24} />
            <Text className="text-white text-lg font-semibold">
              Configurações
            </Text>
          </View>
          <View className="flex flex-row items-center gap-2 p-4 rounded-lg bg-black-90">
            <Avatar className="w-12 h-12">
              <AvatarImage
                className="rounded-full"
                source={require("@/assets/images/profile2.png")}
              />
            </Avatar>
            <View className="flex flex-row items-center gap-1">
              <Text className="text-white text-base font-semibold">
                Pedro Oliveira
              </Text>
              <VerifiedIcon width={18} heigth={18} />
            </View>
          </View>
        </View>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{
            paddingBottom: 42
          }}
        >
          {props.state.routes.map((route, index) => {
            const options = props.descriptors[route.key]
              .options as CustomOptions

            if (options.title === undefined) {
              return
            }

            const onPress = () => {
              const event = props.navigation.emit({
                type: "drawerItemPress",
                canPreventDefault: true,
                target: route.key,
              })

              if (!event.defaultPrevented) {
                props.navigation.navigate(route.name, route.params)
              }
            }

            return (
              <View key={route.key} className="w-full">
                <DrawerButton
                  title={options.title}
                  Icon={options.iconName}
                  isDivider={options.isDivider}
                  onPress={onPress}
                />
              </View>
            )
          })}
          {/* {configNavigation.map(({Icon, name}) => (
            <TouchableOpacity key={name} className="flex flex-row justify-between items-center gap-2 px-6 h-[72px] border-b-[1px] border-black-80">
              <View className="flex flex-row items-center gap-2">
                <Icon width={24} heigth={24} />
                <Text className="text-white text-base font-semibold">
                  {name}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.black[70]} />
            </TouchableOpacity>
          ))} */}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
