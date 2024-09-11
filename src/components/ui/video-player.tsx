import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useWindowDimensions } from 'react-native';
import { PlayCircle } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '@/styles/colors';
import { useFocusEffect } from 'expo-router';

const VideoPlayer = ({ source }: { source: string }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const isFocused = useIsFocused();

  const isBuffering = status?.isLoaded && status.isBuffering;

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (videoRef.current) {
          videoRef.current.stopAsync();
        }
      };
    }, [])
  );

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && isFocused) {
        videoRef.current?.playAsync();
      } else {
        videoRef.current.pauseAsync();
      }
    }
  }, [isPlaying, isFocused]);

  const onPress = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pauseAsync().then(() => {
        videoRef.current?.setStatusAsync({ shouldPlay: false });
        setIsPlaying(false);
      });
    } else {
      videoRef.current.playAsync().then(() => {
        videoRef.current?.setStatusAsync({ shouldPlay: true });
        setIsPlaying(true);
      });
    }
  };

  if (!source) return null;

  return (
    <View className="flex flex-col items-center">
      {isPlaying ? (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsMuted(!isMuted)}
          className="w-full h-[350px] rounded-xl mt-3"
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
            onPlaybackStatusUpdate={setStatus}
            isLooping
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onPress}
          className="w-full h-[350px] rounded-xl mt-3 relative flex justify-center items-center"
        >
          <Image
            source={require('@/assets/images/profile2.png')}
            className="w-full h-full rounded-xl"
            resizeMode="cover"
          />
          <PlayCircle className="w-12 h-12 absolute" color={colors.brand.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default VideoPlayer;
