import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronLeft, Search } from "lucide-react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { colors } from "@/styles/colors";
import LogoIcon from "@/assets/icons/logo-small.svg";
import UserIcon from "@/assets/icons/user-check.svg";
import { FormField } from "@/components/ui/form-field";
import { Avatar, AvatarImage } from "@/components/Avatar";
import { users } from "@/constants/mock";

export default function Followers() {
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  console.log('id', id)
  return(
    <View className="flex-1 bg-black-100 overflow-hidden">
      <SafeAreaView>
        <View className="flex flex-row items-center gap-4 h-[72px] px-6 border-b-[1px] border-black-80">
          <TouchableOpacity className="p-2 rounded-lg border border-black-80" onPress={() => navigation.goBack()}>
            <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
          <LogoIcon width={102} heigth={11} />
        </View>
        <View className="flex flex-col gap-6 p-6">
          <View className="flex flex-row items-center gap-2">
            <UserIcon width={24} heigth={24} />
            <Text className="text-white text-lg font-semibold">
              Meus seguidores
            </Text>
          </View>

          <FormField
            placeholder="Buscar"
            value={''}
            handleChangeText={(e) => {}}
            rightIcon={Search}
          />

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex flex-col gap-4 pb-[400px]">

              {users.map(user => (
                <View key={user.id} className="flex flex-row items-center justify-between w-full">
                <View className="flex flex-row items-center gap-2 ">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      className="rounded-full"
                      source={user.avatar}
                    />
                  </Avatar>
                  <View>
                    <Text className="text-white text-lg text-start font-semibold">
                      {user.name}
                    </Text>
                    <Text className="text-brand-grey text-sm text-start font-regular">
                      {user.username}
                    </Text>
                  </View>
                </View>

                {user.isFollowing ? 
                  <TouchableOpacity className="px-3 py-1 bg-black-80 rounded-[64px] ">
                    <Text className="text-base text-neutral-400">Seguindo</Text>
                  </TouchableOpacity>
                  :
                  <TouchableOpacity className="px-3 py-1 border border-brand-green rounded-[64px] ">
                    <Text className="text-base text-brand-green ">+ Seguir</Text>
                  </TouchableOpacity>
                }

              </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  )
}