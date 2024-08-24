import { Tabs } from 'expo-router';
import React, { useRef } from 'react';
import icons from '@/constants/icons';
import { Image, ImageSourcePropType, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import "@/styles/global.css"
import BottomSheet from '@gorhom/bottom-sheet';
import CreateBottomSheet from '@/components/ui/create-bottom-sheet';
import { CommentProvider } from '@/context/comment-context';
import CommentBottomSheet from '@/components/ui/comment-bottom-sheet';

type TabIconProps = {
  icon: ImageSourcePropType;
  color: string;
  name: string;
  focused: boolean;
};

const TabIcon = ({ icon, color, name, focused }: TabIconProps) => {
  return (
    focused ? (
      <LinearGradient
        className="flex-1"
        colors={['#161616', '#161616', 'rgba(44, 196, 32, 0)', 'rgba(44, 196, 32, 0.08)']}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        locations={[0, 0.5, 0.5, 1]}
      >
        <View className="flex items-center justify-center w-16 h-full bg-custom-gradient border-t-2 border-brand-green">
          <Image
            source={icon}
            resizeMode="contain"
            tintColor={color}
            className="w-8 h-8"
          />
        </View>
      </LinearGradient>
    ) : (
      <View className="flex items-center justify-center w-16 h-full">
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          className="w-8 h-8"
        />
      </View>
    )
  );
};

export default function TabLayout() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const openBottomSheet = () => {
    bottomSheetRef.current?.snapToIndex(1)
  };

  return (
    <CommentProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#2CC420",
          tabBarInactiveTintColor: "#565656",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "#161616",
            borderTopColor: "#161616",
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                name={focused ? 'home' : 'home-outline'} 
                color={color} 
                focused={focused}
                icon={icons.home}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: 'Comunidades',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                name={focused ? 'community' : 'community-outline'} 
                color={color} 
                focused={focused}
                icon={icons.community}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="create"
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openBottomSheet();
            },
          }}
          options={{
            title: 'Create',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                name={focused ? 'create' : 'create-outline'} 
                color={color} 
                focused={focused}
                icon={icons.create}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="reels"
          options={{
            title: 'Reels',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                name={focused ? 'reels' : 'reels-outline'} 
                color={color} 
                focused={focused}
                icon={icons.reels}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="store"
          options={{
            title: 'Store',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                name={focused ? 'store' : 'store-outline'} 
                color={color} 
                focused={focused}
                icon={icons.store}
              />
            ),
          }}
        />
      </Tabs>
      <CreateBottomSheet ref={bottomSheetRef}/>
      <CommentBottomSheet />
    </CommentProvider>
  );
}
