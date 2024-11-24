import React, { useState, useRef, useEffect, memo } from 'react';
import { View, Pressable, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { replaceMediaUrl } from '@/lib/utils';

const VideoPlayer = ({ source }: { source: string }) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isThumbnailVisible, setIsThumbnailVisible] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  const isBuffering = status?.isLoaded && status.isBuffering;

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current
          .playAsync()
          .catch((error) => console.error("Erro ao iniciar o vídeo:", error));
      } else {
        videoRef.current
          .pauseAsync()
          .catch((error) => console.error("Erro ao pausar o vídeo:", error));
      }
    }
  }, [isPlaying]);

  const handlePlayPause = () => {
    setIsPlaying((prev) => !prev);
    setIsThumbnailVisible(false);
  };

  const handleReadyForDisplay = () => {
    setIsThumbnailVisible(false); // Oculta a thumbnail quando o vídeo estiver pronto.
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    setStatus(status);
    if (status?.didJustFinish) {
      setIsPlaying(false);
      setIsThumbnailVisible(true); // Exibe a thumbnail novamente após o término do vídeo.
    }
  };

  if (!source) return null;

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePlayPause} style={styles.content}>
        {isThumbnailVisible && (
          <Image
            source={{ uri: replaceMediaUrl(source) }}
            style={[styles.video]}
            resizeMode="cover"
          />
        )}
        <Video
          ref={videoRef}
          style={[styles.video, isThumbnailVisible ? { display: 'none' } : {}]}
          source={{ uri: source }}
          resizeMode={ResizeMode.COVER}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          onReadyForDisplay={handleReadyForDisplay}
          shouldPlay={isPlaying}
          isLooping={false}
          useNativeControls={false}
          onError={(error) => console.error("Erro no Video Player:", error)}
        />
        {!isPlaying && !isBuffering && (
          <>
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 16 }]}
            />
            <Ionicons
              style={styles.playIcon}
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
              style={styles.bufferingIndicator}
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
    height: 350,
    borderRadius: 16,
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  content: {
    height: '100%',
  },
  playIcon: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
  },
  bufferingIndicator: {
    position: "absolute",
    alignSelf: "center",
    top: "50%",
  },
});

export default memo(VideoPlayer);
