import { StyleSheet, Image, View, ImageSourcePropType } from 'react-native';
import React, { memo } from 'react';
import Carousel from 'pinar';
import { colors } from '@/styles/colors';

interface ImageCarouselProps {
  imageUrls: ImageSourcePropType[];
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ imageUrls }) => {
  const RenderImage = ({ uri }: { uri: ImageSourcePropType  }) => (
    <Image
      source={uri}
      style={styles.image}
      resizeMode="cover"
    />
  );

  if (imageUrls.length === 1) {
    return <RenderImage uri={imageUrls[0]} />;
  }

  return (
    <View style={styles.container}>
      <Carousel
        style={styles.carousel}
        showsControls={false}
        dotStyle={styles.dotStyle}
        activeDotStyle={[styles.dotStyle, { backgroundColor: colors.primary }]}
      >
        {imageUrls.map((url, index) => (
          <RenderImage key={index} uri={url} />
        ))}
      </Carousel>
    </View>
  );
};

export default memo(ImageCarousel);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 184,
  },
  image: {
    height: 164,
    minHeight: 164,
    width: '100%',
  },
  dotStyle: {
    width: 8,
    height: 8,
    backgroundColor: colors.black[80],
    marginHorizontal: 4,
    borderRadius: 50,
    marginBottom: -40,
  },
  carousel: {
    height: 'auto',
    width: '100%',
  },
});
