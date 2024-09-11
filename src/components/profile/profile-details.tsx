import { Image, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { Header } from "@/components/ui/header";
import images from "@/constants/images";
import { Avatar, AvatarImage } from "@/components/Avatar";
import VerifiedIcon from "@/assets/icons/verified.svg";
import PostIcon from "@/assets/icons/post.svg";
import PostGreenIcon from "@/assets/icons/post-green.svg";
import ReelsIcon from "@/assets/icons/reels.svg";
import ReelsGreenIcon from "@/assets/icons/reels-green.svg";
import DailyIcon from "@/assets/icons/daily.svg";
import DailyGreenIcon from "@/assets/icons/daily-green.svg";
import PostGrid from "@/components/ui/post-grid";
import { colors } from "@/styles/colors";
import ReelsGrid from "@/components/ui/reels-grid";
import { users } from "@/constants/mock";
import TabProfile from "../ui/tab-profile";
import { ChevronLeft } from "lucide-react-native";
import LogoIcon from "@/assets/icons/logo-small.svg";
import { router } from "expo-router";

const { Navigator, Screen } = createMaterialTopTabNavigator();

export default function ProfileDetails() {
  const user = users[0];
  const onPressItem = () => {
  };
  return (
    <ScrollView className="flex flex-1 bg-black-100" showsVerticalScrollIndicator={false}>
       <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={() => router.back()}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} heigth={11} />
        </View>

      <View style={{ flex: 1 }} className="h-auto">
        <View className="relative bg-black-60">
          {images.banner ? (
            <Image
              source={images.banner}
              className="w-full h-40"
              resizeMode="cover"
            />
          ) : (
            <View className="bg-black-60 w-full h-40" />
          )}
          <View className="px-6 absolute -bottom-14">
            <Avatar className="w-28 h-28 border-[4px] border-black-100">
              <AvatarImage className="rounded-full" source={user.avatar} />
            </Avatar>
          </View>
        </View>
        <View className="flex flex-col gap-4 px-6 mt-20">
          <View className="flex flex-row items-center gap-1">
            <Text className="text-2xl text-white font-semibold">
              Pedro Oliveira
            </Text>
            <VerifiedIcon width={18} heigth={18} />
          </View>
          <View className="flex flex-row items-center gap-1 w-full">
            <Text className="text-base text-white font-medium">
              🌿 Defensor da dieta baseada em plantas pedro@growzone.com
            </Text>
          </View>
        </View>
        <View className="flex flex-col gap-1 px-6 mt-6">
          <View className="flex flex-row justify-between px-6 py-4">
            <View className="flex flex-col items-center gap-1">
              <Text className="text-lg text-white font-medium">1.564</Text>
              <Text className="text-sm text-brand-grey font-regular">
                Seguidores
              </Text>
            </View>
            <View className="flex flex-col items-center gap-1">
              <Text className="text-lg text-white font-medium">10</Text>
              <Text className="text-sm text-brand-grey font-regular">
                Seguindo
              </Text>
            </View>
            <View className="flex flex-col items-center gap-1">
              <Text className="text-lg text-white font-medium">Set/2024</Text>
              <Text className="text-sm text-brand-grey font-regular">
                Membro desde
              </Text>
            </View>
          </View>
          <View className="flex flex-row justify-between bg-black-90 rounded-lg px-6 py-4">
            <View className="flex flex-col items-center gap-1">
              <View className="flex flex-row items-center justify-center gap-1">
                <PostGreenIcon width={18} heigth={18} />
                <Text className="text-lg text-brand-green font-medium">20</Text>
              </View>
              <Text className="text-sm text-brand-grey font-regular">
                Posts
              </Text>
            </View>
            <View className="flex flex-col items-center gap-1">
              <View className="flex flex-row items-center justify-center gap-1">
                <ReelsGreenIcon width={18} heigth={18} />
                <Text className="text-lg text-brand-green font-medium">8</Text>
              </View>
              <Text className="text-sm text-brand-grey font-regular">
                Wells
              </Text>
            </View>
            <View className="flex flex-col items-center gap-1">
              <View className="flex flex-row items-center justify-center gap-1">
                <DailyGreenIcon width={18} heigth={18} />
                <Text className="text-lg text-brand-green font-medium">10</Text>
              </View>
              <Text className="text-sm text-brand-grey font-regular">
                Diários
              </Text>
            </View>
          </View>

          <View className="flex flex-col gap-1 mt-6">
            {user.isFollowing ? (
              <TouchableOpacity className="flex items-center justify-center px-3 py-1 bg-black-80 rounded-[64px] h-12">
                <Text className="text-lg text-neutral-400 text-center">
                  Seguindo
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="flex items-center justify-center px-3 py-1 border border-brand-green rounded-[64px] h-12">
                <Text className="text-base text-brand-green ">+ Seguir</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View className="mt-8 h-full ">
        <TabProfile onPress={onPressItem} />
        {/* <Navigator
          screenOptions={{
            tabBarShowLabel: false,
            tabBarActiveTintColor: "#2CC420",
            tabBarInactiveTintColor: "#565656",
            tabBarStyle: {
              height: 64,
              justifyContent: "center",
            },
            tabBarIndicatorContainerStyle: {
              backgroundColor: colors.black[100],
              height: "100%",
            },
            tabBarItemStyle: {
              paddingHorizontal: 16,
              justifyContent: "center",
            },
            tabBarIndicatorStyle: {
              backgroundColor: colors.primary,
            },
            tabBarIconStyle: {
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            },
            tabBarPressOpacity: 0.7,
          }}
        >
          <Screen
            name="post-grid"
            component={PostGrid}
            options={{
              tabBarIcon: ({ focused }) =>
                focused ? (
                  <PostGreenIcon width={32} heigth={32} />
                ) : (
                  <PostIcon width={32} heigth={32} />
                ),
            }}
          />
          <Screen
            name="reels-grid"
            component={ReelsGrid}
            options={{
              tabBarIcon: ({ focused }) => (
                <View className="flex items-center justify-center w-full h-full">
                  {focused ? (
                    <ReelsGreenIcon width={32} heigth={32} />
                  ) : (
                    <ReelsIcon width={32} heigth={32} />
                  )}
                </View>
              ),
            }}
          />
          <Screen
            name="diario"
            component={PostGrid}
            options={{
              tabBarIcon: ({ focused }) => (
                <View className="flex items-center justify-center w-full h-full">
                  {focused ? (
                    <DailyGreenIcon width={32} heigth={32} />
                  ) : (
                    <DailyIcon width={32} heigth={32} />
                  )}
                </View>
              ),
            }}
          />
        </Navigator> */}
      </View>
    </ScrollView>
  );
}
