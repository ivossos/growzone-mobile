import { Image, StyleSheet, Platform, ScrollView, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';
import { Header } from '@/components/ui/header';
import { Stories } from '@/components/ui/stories';
import { CardPost } from '@/components/ui/card-post';


export default function HomeScreen() {
  return (
    <SafeAreaView className='bg-black-100 h-full'>
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <Header />
        <Stories />
        <CardPost />
      </ScrollView>
    </SafeAreaView>
  );
}