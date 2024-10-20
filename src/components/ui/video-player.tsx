import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { View, TouchableOpacity, Image, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { useWindowDimensions } from 'react-native';
import { PlayCircle } from 'lucide-react-native';
import { useIsFocused } from '@react-navigation/native';
import { colors } from '@/styles/colors';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
          videoRef.current.stopAsync().catch(error => console.error("Erro ao parar o vídeo:", error))
        }
      };
    }, [])
  );

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying && isFocused) {
        videoRef.current?.playAsync().catch(error => console.error("Erro ao gerenciar a reprodução:", error));
      } else {
        videoRef.current.pauseAsync().catch(error => console.error("Erro ao gerenciar a reprodução:", error));
      }
    }
  }, [isPlaying, isFocused]);

  const onPressPlayPause = () => {
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
    <View style={[styles.container]}>
      <Pressable onPress={onPressPlayPause} style={styles.content}>
    <Video
      ref={videoRef}
      style={[StyleSheet.absoluteFill, styles.video]}
      source={{ uri: source }}
      resizeMode={ResizeMode.COVER}
      onPlaybackStatusUpdate={setStatus}
      shouldPlay={isPlaying && isFocused}
      isLooping={false}
      useNativeControls={false}
      onError={(error) => console.error("Video error Video player:", error)}
    />

      
        
     {!isPlaying && !isBuffering && (
      <>
        <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.8)"]}
        style={[StyleSheet.absoluteFillObject]}
        />
            <Ionicons
              style={{ position: "absolute", alignSelf: "center", top: "50%" }}
              name="play"
              size={70}
              color="rgba(255, 255, 255, 0.6)"
            />
          </>
          )}
          {isBuffering && (
            <>
             <LinearGradient
             colors={["transparent", "rgba(0,0,0,0.8)"]}
             style={[StyleSheet.absoluteFillObject]}
             />
            <ActivityIndicator
              style={{ position: "absolute", alignSelf: "center", top: "50%" }}
              size="large"
              color="#FFFFFF"
            />
            </>
          )}
    </Pressable>

  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 16 ,
  },
  video: {
    height: '100%',
    borderRadius: 16
  },
  content: {
    flex: 1,
  },
});

export default memo(VideoPlayer);
