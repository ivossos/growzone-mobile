import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { useWindowDimensions } from 'react-native';
import { PlayCircle } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '@/styles/colors';

const VideoPlayer = ({ source }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { width } = useWindowDimensions();
  const isFocused = useIsFocused(); // To check if the screen is focused

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && isFocused) {
        videoRef.current?.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isPlaying, isFocused]);

  if (!source) return null;

  return (
    <View className="flex flex-col items-center">
      {isPlaying ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsMuted(!isMuted)} // Toggle mute on press
        >
          <Video
            ref={videoRef}
            source={{ uri: source }}
            style={{ width: '100%', height: 350, borderRadius: 16 }}
            resizeMode={ResizeMode.COVER}
            useNativeControls={false}
            rate={1.0}
            isMuted={isMuted}
            shouldPlay={isPlaying && isFocused}
            onPlaybackStatusUpdate={(status) => {
              if (status.didJustFinish) {
                setIsPlaying(false);
              }
            }}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsPlaying(true)}
          className="w-full h-60 rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={{ uri: require("@/assets/images/profile2.png") }}
            className="w-full h-full rounded-xl mt-3"
            resizeMode="cover"
          />
          <PlayCircle className="w-12 h-12 absolute" color={colors.brand.white}/>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoPlayer;
