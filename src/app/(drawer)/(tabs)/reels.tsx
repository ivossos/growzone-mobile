import { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlatList, TouchableOpacity, View, ViewabilityConfigCallbackPair } from "react-native";
import { Stack, useNavigation } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/styles/colors";

import ReelsPost from "@/components/ui/reels-post";
import { reelsMock } from "@/constants/mock";
import { Camera, ChevronLeft } from "lucide-react-native";
import LogoIcon from "@/assets/icons/logo-small-white.svg";
import BottomSheet from "@gorhom/bottom-sheet";
import { useBottomSheetContext } from "@/context/bottom-sheet-context";

export default function Reels() {
  const [activePostId, setActivePostId] = useState(reelsMock[0].id);
  const [posts, setPosts] = useState<typeof reelsMock>([]);
  const { openBottomSheet } = useBottomSheetContext();


  const handleBottomSheet = (post: any) => {
    openBottomSheet({ type: 'comment', id: post})
  };
  
  
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPosts = async () => setPosts(reelsMock);
    
    fetchPosts();
  }, []);

  const viewabilityConfigCallbackPairs = useRef<ViewabilityConfigCallbackPair[]>([
    {
      viewabilityConfig: { itemVisiblePercentThreshold: 80 },
      onViewableItemsChanged: ({ changed, viewableItems }) => {
        if (viewableItems?.length > 0 && viewableItems[0].isViewable) {
          console.log("video => ", viewableItems);
          setActivePostId(viewableItems[0].item.id);
        }
      },
    },
  ]);

  const onEndReached = () => {
    setPosts((currentPosts) => [...currentPosts, ...reelsMock]);
  };

  return (
    <View style={{  backgroundColor: colors.black[100] }}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar backgroundColor={colors.black[100]} style="light" />

      <SafeAreaView
        style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 }}>
        <View className="flex flex-row items-center justify-between h-[72px] px-6">
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity className="p-2 rounded-lg border border-brand-white" style={{borderColor: 'rgba(255, 255, 255, 0.16)'}} 
              onPress={() => navigation.goBack()}>
              <ChevronLeft className="w-8 h-8" color={colors.brand.white} />
            </TouchableOpacity>
            <LogoIcon width={107} heigth={11} />
          </View>
          <TouchableOpacity>
            <Camera className="w-8 h-8" color={colors.brand.white} />
          </TouchableOpacity>
        </View>
        
      </SafeAreaView>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <ReelsPost post={item} activePostId={activePostId} openComment={handleBottomSheet}/>
        )}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        pagingEnabled
        viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
        showsVerticalScrollIndicator={false}
        onEndReached={onEndReached}
        onEndReachedThreshold={3}
      />
    </View>
  );
}