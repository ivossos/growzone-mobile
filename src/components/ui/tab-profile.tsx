import React, { useState, useRef } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";

import TabContent from "./tab-content";
import { colors } from "@/styles/colors";
import PostIcon from "@/assets/icons/post.svg";
import PostGreenIcon from "@/assets/icons/post-green.svg";
import ReelsIcon from "@/assets/icons/reels.svg";
import ReelsGreenIcon from "@/assets/icons/reels-green.svg";
import clsx from "clsx";
import PostGrid from "./post-grid";
import ReelsGrid from "./reels-grid";

const w = Dimensions.get("screen").width;

const tabs = [
  { id: 1, title: "Posts", Icon: PostIcon, IconSelected: PostGreenIcon },
  { id: 2, title: "Wellz", Icon: ReelsIcon, IconSelected: ReelsGreenIcon },
];

const TabProfile = ({ onPress }) => {
  const [selected, setSelected] = useState(1);
  const [isManuallyScrolling, setIsManuallyScrolling] = useState(false); // Controle manual do scroll
  const scrollRef = useRef(null);

  const onScroll = ({ nativeEvent }) => {
    if (isManuallyScrolling) return; // Ignora onScroll enquanto manualmente estamos mudando de aba

    const index = Math.round(nativeEvent.contentOffset.x / w);
    const tab = tabs[index];
    if (tab) {
      setSelected(tab.id); // Atualiza a aba com base no scroll
    }
  };

  const handleTabPress = (id) => {
    setSelected(id);
    setIsManuallyScrolling(true); // Inicia scroll manual
    const index = tabs.findIndex(tab => tab.id === id);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: index * w, animated: true });
    }

    // Reinicia controle após o scroll
    setTimeout(() => {
      setIsManuallyScrolling(false); 
    }, 300); // Tempo suficiente para o scroll acontecer
  };

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
            {tab.id === 1 && <PostGrid />}
            {tab.id === 2 && <ReelsGrid />}
          </View>
        ))}
      </ScrollView>

    </>
  );
};

export default TabProfile;
