import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import icons from '@/constants/icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Image, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styled } from 'nativewind';

const StyledLinearGradient = styled(LinearGradient);

const TabIcon = ({ icon, color, name, focused }) => {
  return (
    focused ? (
      <StyledLinearGradient
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
            className="w-6 h-6"
          />
        </View>
      </StyledLinearGradient>
    ) : (
      <View className="flex items-center justify-center w-16 h-full">
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          className="w-6 h-6"
        />
      </View>
    )
  );
};


export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: "#2CC420",
      tabBarInactiveTintColor: "#565656",
      tabBarShowLabel: false,
      
      tabBarStyle: {
        backgroundColor: "#161616",
        borderTopColor: "#161616",
      },
    }}>
      <Tabs.Screen
        name="index"
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
              name={focused ? 'home' : 'home-outline'} 
              color={color} 
              focused={focused}
              icon={icons.commmunity}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              name={focused ? 'home' : 'home-outline'} 
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
              name={focused ? 'home' : 'home-outline'} 
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
              name={focused ? 'home' : 'home-outline'} 
              color={color} 
              focused={focused}
              icon={icons.store}
            />
          ),
        }}
      />
    </Tabs>
  );
}
