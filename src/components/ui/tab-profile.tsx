import React, { useState, useRef, useEffect } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import { colors } from "@/styles/colors";
import PostIcon from "@/assets/icons/post.svg";
import PostGreenIcon from "@/assets/icons/post-green.svg";
import ReelsIcon from "@/assets/icons/reels.svg";
import ReelsGreenIcon from "@/assets/icons/reels-green.svg";
import clsx from "clsx";
import PostGrid from "./post-grid";
import ReelsGrid from "./reels-grid";
import { SocialPost } from "@/api/@types/models";
import Toast from "react-native-toast-message";
import { getUserPosts } from "@/api/social/post/get-user-posts";
import { getUserReelsPosts } from "@/api/social/post/get-user-reels-posts";

const w = Dimensions.get("screen").width;

const tabs = [
  { id: 1, title: "Posts", Icon: PostIcon, IconSelected: PostGreenIcon },
  { id: 2, title: "Wellz", Icon: ReelsIcon, IconSelected: ReelsGreenIcon },
];

type TabProfileProps = {
  userId: number;
}

const TabProfile = ({ userId }: TabProfileProps) => {
  const [selected, setSelected] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [reels, setReels] = useState<SocialPost[]>([]);
  const [isManuallyScrolling, setIsManuallyScrolling] = useState(false);
  const scrollRef = useRef(null);

  const onScroll = ({ nativeEvent }) => {
    if (isManuallyScrolling) return;

    const index = Math.round(nativeEvent.contentOffset.x / w);
    const tab = tabs[index];
    if (tab) {
      setSelected(tab.id); 
    }
  };

  const handleTabPress = (id) => {
    setSelected(id);
    setIsManuallyScrolling(true);
    const index = tabs.findIndex(tab => tab.id === id);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * w, animated: true });
    }

    setTimeout(() => {
      setIsManuallyScrolling(false); 
    }, 300);
  };

  const fetchPostsData = async () => {
    try {
      setIsLoading(true);
      const data = await getUserPosts({ id: userId });
      setPosts(data);

      const reels = await getUserReelsPosts({ id: userId })
      setReels(reels);

    } catch (error) {
      console.log('erro  ao buscar as postagens: ', error )
      Toast.show({
        type: 'error',
        text1: 'Opss',
        text2: 'Aconteceu um erro ao buscar as postagens desse perfil", "Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchPostsData();
  }, [userId]);
 

  return (
    <>
      <View className="flex flex-row gap-3 h-16 border-b-[1px] border-black-80">
        {tabs.map(({ id, title, Icon, IconSelected }) => (
          <Pressable 
            key={id} 
            onPress={() => handleTabPress(id)}
            className={clsx("flex flex-row gap-2 items-center justify-center px-4 h-full mx-auto", { 'border-b-[1px] border-primary': selected === id})}
          >
            {selected === id ? (
              <IconSelected width={24} height={24} />
            ) : (
              <Icon width={24} height={24} />
            )}

            {selected === id && 
              <Text className="text-base font-regular text-white text-center">
                {title}
              </Text>
            }
          </Pressable>
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        onScroll={onScroll}
        decelerationRate="fast"
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
      >
        {tabs.map((tab) => (
          <View className="mt-4" key={tab.id} style={{ width: w }}>
            {tab.id === 1 && <PostGrid posts={posts} />}
            {tab.id === 2 && <ReelsGrid reels={reels} />}
          </View>
        ))}
      </ScrollView>

    </>
  );
};

export default TabProfile;
