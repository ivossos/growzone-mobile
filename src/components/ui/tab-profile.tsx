import React, { useState, useRef } from "react";
import { Dimensions, ScrollView, Text, View, Pressable } from "react-native";
import PagerView from 'react-native-pager-view';

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

type TabProfileProps = {
  userId: number;
}

const TabProfile = ({ userId }: TabProfileProps) => {
  const [selected, setSelected] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const handleTabPress = (id: number) => {
    setSelected(id);
    if (pagerRef.current) {
      pagerRef.current.setPage(id - 1);
    }
  };

  const handlePageSelected = (e: any) => {
    const index = e.nativeEvent.position;
    setSelected(tabs[index].id);
  };

  const handleContentSizeChange = (width: number, height: number) => {
    setContentHeight(height);
  };

  return (
    <>
      <View className="flex flex-row gap-3 h-16 border-b-[1px] border-black-80">
        {tabs.map(({ id, title, Icon, IconSelected }) => (
          <Pressable 
            key={id} 
            onPress={() => handleTabPress(id)}
            className={clsx("flex flex-row gap-2 items-center justify-center px-4 h-full mx-auto", { 'border-b-[1px] border-primary': selected === id })}
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

      <View style={{ height: contentHeight }}>
        <PagerView
          ref={pagerRef}
          style={{ flex: 1 }}
          initialPage={0}
          onPageSelected={handlePageSelected}
        >
          <View key="1" style={{ width: w }}>
            {selected === 1 && (
              <ScrollView onContentSizeChange={handleContentSizeChange}>
                <PostGrid userId={userId} />
              </ScrollView>
            )}
          </View>

          <View key="2" style={{ width: w }}>
            {selected === 2 && (
              <ScrollView onContentSizeChange={handleContentSizeChange}>
                <ReelsGrid userId={userId} />
              </ScrollView>
            )}
          </View>
        </PagerView>
      </View>
    </>
  );
};

export default TabProfile;
