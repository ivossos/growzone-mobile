import Button from "@/components/ui/button";
import ContributorCard from "@/components/ui/contributor-card";
import { FormField } from "@/components/ui/form-field";
import ReelsCard from "@/components/ui/reels-card";
import { postsMock, users } from "@/constants/mock";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";
import { colors } from "@/styles/colors";
import { router } from "expo-router";
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowLeft,
  ArrowRight,
  Filter,
  Search,
} from "lucide-react-native";
import { useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  FlatList,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const [search, setSearch] = useState("");

  const { openBottomSheet } = useBottomSheetContext();

  const handleOpenFilterBottomSheet = () => {
    openBottomSheet('search', undefined);
  };


  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <View className="flex-1 bg-black-100 overflow-hidden">
        {/* Cabeçalho */}
        {/* <View className="flex flex-row items-center gap-4 px-6 h-[72px] border-b-[1px] border-black-80">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft className="w-6 h-6" color={colors.brand.white} />
          </TouchableOpacity>
          <Text className="text-white text-base font-semibold">
            Pesquisa Global
          </Text>
        </View> */}

        <View className="flex flex-row gap-2 py-6 px-6">
          <FormField
            placeholder="Pesquisa Global"
            value={search}
            handleChangeText={(e) => setSearch(e)}
            type="clear"
            otherStyles="flex-1"
            leftIcon={Search}
          />
          <TouchableOpacity className="flex items-center justify-center w-14 px-3 bg-black-90 rounded-lg" onPress={handleOpenFilterBottomSheet}>
            <Filter size={20} color={colors.black[70]} />
          </TouchableOpacity>
        </View>

        
        <FlatList
          data={[{ key: 'contributors' }, { key: 'reels' }]} // chave para identificar as seções
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-6"
          renderItem={({ item }) => {
            if (item.key === 'contributors') {
              return (
                <View className="flex flex-col gap-5 px-6">
                  <Text className="text-lg text-white font-semibold">
                    Top Contribuidores
                  </Text>
                  <FlatList
                    data={users}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(user) => user.id}
                    renderItem={({ item }) => (
                      <ContributorCard key={item.id} user={item} />
                    )}
                    contentContainerStyle={{ gap: 16 }}
                  />
                </View>
              );
            } else if (item.key === 'reels') {
              return (
                <View className="flex flex-col gap-5 px-6 pt-6">
                  <View className="flex flex-row justify-between items-center ">
                    <Text className="text-lg text-white font-semibold">
                      Weelz em Alta
                    </Text>
                    <TouchableOpacity className="flex items-center flex-row gap-1" onPress={() => router.navigate('/reels')}>
                      <Text className="text-primary text-base font-medium">ver mais</Text>
                      <ArrowRight size={18} color={colors.brand.green}/>
                    </TouchableOpacity>
                  </View>
                  <FlatList
                    data={postsMock}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(post) => post.id}
                    renderItem={({ item }) => (
                      <ReelsCard key={item.id} {...item} />
                    )}
                    contentContainerStyle={{ gap: 16 }}
                  />
                </View>
              );
            }
          }}
        />
      </View>
    </SafeAreaView>
  );
}
