import {StyleSheet, Image } from 'react-native';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Carousel from 'pinar';

import { colors } from '@/styles/colors';
import VideoPlayer from './video-player';
import { SocialPostFile } from '@/api/@types/models';

interface MediaSliderProps {
  items: SocialPostFile[];
  postId: number;
}

const MediaSlider = ({ items, postId }: MediaSliderProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleIndexChange = useCallback(({ index }: {index: number}) => {
    if (index < 0 || index >= items.length) return;

    const item = items[index];

    if (item?.type === 'video') {
      setActiveIndex(index);
    }
  }, [items, setActiveIndex]);

  const RenderItem = ({ item, index }: { item: SocialPostFile, index: number }) => {
    const isActive = activeIndex === index;
    if (item.type === 'image') {
      return (
        <Image
          source={{ uri: item.file }}
          style={{ width: '100%', height: 350, borderRadius: 16 }}
          resizeMode="cover"
        />
      );
    }

    return (
      <VideoPlayer
        source={item.file}
        postId={postId}
        isActive={isActive}
      />
    );
  };

  if(items.length === 1) {
    return <RenderItem item={items[0]} index={0}  />
  }

  const renderedItems = useMemo(() => {
    return items.map((item, index) => (
      <RenderItem key={item.id} item={item} index={index} />
    ));
  }, [items]);

  return (
    <Carousel
      style={styles.carousel}
      showsControls={false}
      dotStyle={styles.dotStyle}
      activeDotStyle={[styles.dotStyle, { backgroundColor: colors.primary }]}
      onIndexChanged={handleIndexChange}
    >
      {items.map((item, index) => (
        <RenderItem key={item.id} item={item} index={index} />
      ))}
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