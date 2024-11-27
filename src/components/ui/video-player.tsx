import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { View, Pressable, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { replaceMediaUrl } from '@/lib/utils';
import { useActivePostHome } from '@/hooks/use-active-post-home';

const VideoPlayer = ({ source, postId, isActive }: { source: string, postId: number, isActive: boolean }) => {
  const video = useRef<Video>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { activePostId } = useActivePostHome();

  const handlePlaybackStatus = (status) => {
    setIsPlaying(status.isPlaying);
    if (status.didJustFinish && video.current) {
      video.current.playFromPositionAsync(0);
    }
  };

  const managePlayback = useCallback(async () => {
    if (!video.current) return;
  
    try {
      if (isActive && activePostId === postId) {
        const status = await video.current.getStatusAsync();
        if (!status.isLoaded) {
          await video.current.loadAsync({ uri: source }, { shouldPlay: true });
        } else {
          await video.current.playAsync();
        }
      } else {
        await video.current.pauseAsync();
        await video.current.unloadAsync();
        setIsVideoLoaded(false);
      }
    } catch (error) {
      console.error("Erro ao gerenciar reprodução:", error);
    }
  }, [isActive, activePostId, postId, source]);

  useEffect(() => {
    managePlayback();
  }, [managePlayback]);

  const onPress = async () => {
    if (!video.current) return;
    if (isPlaying) {
      await video.current.pauseAsync();
    } else {
      await video.current.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={onPress} style={styles.content}>
        {!isVideoLoaded && (
          <Image
            source={{ uri: replaceMediaUrl(source) }}
            style={styles.video}
            resizeMode="cover"
          />
        )}
        <Video
          ref={video}
          style={[styles.video, !isVideoLoaded && { opacity: 0 }]}
          source={{ uri: source }}
          resizeMode={ResizeMode.COVER}
          onLoadStart={() => setIsVideoLoaded(false)}
          onLoad={() => setIsVideoLoaded(true)}
          onPlaybackStatusUpdate={handlePlaybackStatus}
          isLooping
          isMuted={false}
          onError={(error) => console.log('Playback Error:', error)}
        />
        {!isPlaying && (
          <>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="play" size={70} color="rgba(255,255,255,0.6)" style={styles.playIcon} />
          </>
        )}
        {isPlaying && !isVideoLoaded && <ActivityIndicator size="large" color="#FFF" />}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { height: 350, borderRadius: 16 },
  video: { width: '100%', height: '100%', borderRadius: 16 },
  content: { height: '100%' },
  playIcon: { position: 'absolute', alignSelf: 'center', top: '50%' },
});

export default memo(VideoPlayer);
