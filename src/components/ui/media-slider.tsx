import {StyleSheet, Image } from 'react-native';
import React, { memo } from 'react';
import Carousel from 'pinar';

import { colors } from '@/styles/colors';
import VideoPlayer from './video-player';
import { SocialPostFile } from '@/api/@types/models';

interface MediaSliderProps {
  items: SocialPostFile[];
}

const MediaSlider: React.FC<MediaSliderProps> = ({ items }: MediaSliderProps) => {

  const RenderItem = ({ item }: { item: SocialPostFile }) => {

    if (item.type === 'image') {
      return (
        <Image
          source={{ uri: item.file }}
          style={{ width: '100%', height: 350, borderRadius: 16 }}
          resizeMode="cover"
        />
      );
    }
    
    return <VideoPlayer source={item.file} />
  };

  if(items.length === 1) {
    return <RenderItem item={items[0]}/>
   }

  return (
    <Carousel
        style={styles.carousel}
        showsControls={false}
        dotStyle={styles.dotStyle}
        activeDotStyle={[styles.dotStyle, { backgroundColor: colors.primary }]}
      >
      {items.map(item => <RenderItem key={item.id} item={item}></RenderItem>)}
    </Carousel>
  );
};

export default memo(MediaSlider);

const styles = StyleSheet.create({
  dotStyle: {
    width: 8,
    height: 8,
    backgroundColor: colors.black[80],
    marginHorizontal: 4,
    borderRadius: 50,
    marginBottom: -90,
  },
  carousel: {
    height: 350,
    minHeight: 350,
    width: '100%',
    borderRadius: 16,
  },
});