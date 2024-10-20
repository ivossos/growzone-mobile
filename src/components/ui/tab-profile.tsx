import React, { memo, useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { TabView, SceneMap, TabBar } from "react-native-tab-view";

import PostIcon from "@/assets/icons/post.svg";
import PostGreenIcon from "@/assets/icons/post-green.svg";
import ReelsIcon from "@/assets/icons/reels.svg";
import ReelsGreenIcon from "@/assets/icons/reels-green.svg";
import GrowGreenIcon from "@/assets/icons/plant-green.svg";
import GrowIcon from "@/assets/icons/plant.svg";

import PostGrid from "./post-grid";
import ReelsGrid from "./reels-grid";
import PlantGrid from "./plant-grid";
import { colors } from "@/styles/colors";
import { ScrollView } from "react-native";

const w = Dimensions.get("screen").width;

const renderTabBar = (props) => (
  <TabBar
    {...props}
    indicatorStyle={{ backgroundColor: colors.brand.green }}
    style={{ backgroundColor: colors.black[100], borderBottomColor: colors.black[100], borderBottomWidth: 1}}
    tabStyle={{ width: w / 3, justifyContent: 'center', alignItems: 'center' }}
    contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', }}
    renderIcon={({ route, focused }) => {
      const icons = {
        posts: focused ? <PostGreenIcon width={24} height={24} /> : <PostIcon width={24} height={24} />,
        wellz: focused ? <ReelsGreenIcon width={24} height={24} /> : <ReelsIcon width={24} height={24} />,
        plantas: focused ? <GrowGreenIcon width={24} height={24} /> : <GrowIcon width={24} height={24} />
      };
      return icons[route.key];
    }}
    renderLabel={({ route, focused }) => focused && (
      <Text style={{ color: 'white', fontSize: 16 }}>
        {route.title}
      </Text>
    )}
  />
);

const TabProfile = ({ userId }) => {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'posts', title: 'Posts' },
    { key: 'wellz', title: 'Wellz' },
    { key: 'plantas', title: 'Plantas' },
  ]);

  const renderScene = SceneMap({
    posts: () => (
      <PostGrid userId={userId} />
    ),
    wellz: () => (
      <ReelsGrid userId={userId} />
    ),
    plantas: () => (
      <PlantGrid userId={userId} />
    )
  });

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: w }}
      renderTabBar={renderTabBar}
      style={{ flex: 1,  }} 
    />
  );
};

export default memo(TabProfile);
