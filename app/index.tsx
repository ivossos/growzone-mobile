import { Image, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import images from '@/constants/images';


export default function Welcome() {
  return (
    <SafeAreaView className='bg-black-100 h-full'>
      <ScrollView contentContainerStyle={{ height: '100%'}}>
        <View className='w-full justify-center items-center h-full px-4'>
          <Image source={images.logoGreen} className='w-[214px] h-[30px]'  resizeMode='contain'/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}