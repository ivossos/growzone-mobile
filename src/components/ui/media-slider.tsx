import { View, StyleSheet, Dimensions, Text, Image } from 'react-native';
import React from 'react';
import Carousel from 'pinar';

import { Media } from './card-post';
import { colors } from '@/styles/colors';
import VideoPlayer from './video-player';

interface MediaSliderProps {
  items: Media[];
}

const MediaSlider: React.FC<MediaSliderProps> = ({ items }: MediaSliderProps) => {

  function removeQueryString(url?: string): string | undefined {

    if(!url) return; 
    
    try {
      const urlObject = new URL(url);
      return urlObject.origin + urlObject.pathname;
    } catch (e) {
      return url;
    }
  }

  if(items.length === 1) {
    if (items[0].type === 'image') {
      return (
        <Image
          source={{ uri: removeQueryString(items[0]?.file || '')  }}
          style={{ width: '100%', height: 350, borderRadius: 16}}
          resizeMode="cover"
        />
      );
    } else if (items[0].type === 'video') {
      return <VideoPlayer source={items[0].hls_url}/>
    }
    return null;
  }


  const RenderItem = ({ item }: { item: Media }) => {
    if (item.type === 'image') {
      return (
        <Image
          source={{ uri: removeQueryString(item?.file || '') }}
          style={{ width: '100%', height: '100%', borderRadius: 16}}
          resizeMode="cover"
        />
      );
    } else if (item.type === 'video') {
      console.log('entrou', item)
      return <VideoPlayer source={item.hls_url}/>
    }
    return null;
  };

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

export default MediaSlider;

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
    width: '100%',
  },
});