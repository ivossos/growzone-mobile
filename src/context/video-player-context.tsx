import React, { createContext, ReactNode, useContext, useRef } from "react";
import { VideoPlayer } from "expo-video";

type VideoPlayerContextType = {
  pauseVideo: () => void;
  playVideo: () => void;
  getPlayer: () => VideoPlayer | undefined;
  toggleAudioMute: (muted: boolean) => void;
  release: () => void;
  setPlayer: (videoData?: VideoPlayer) => void;
  handlerTime: (value: number) => void;
  isMuted: () => boolean;
  clearPlayer: () => void;
  player: VideoPlayer;
};

const VideoPlayerContext = createContext<VideoPlayerContextType | undefined>(
  undefined
);

export const VideoPlayerProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const currentPlayerRef = useRef<VideoPlayer>();

  const getPlayer = () => {
    return currentPlayerRef.current;
  };

  const setPlayer = (videoData?: VideoPlayer) => {
    currentPlayerRef.current = videoData;
  };

  const handlerTime = (value: number) => {
    if (currentPlayerRef.current) {
      currentPlayerRef.current.currentTime = value;
    }
  };

  const toggleAudioMute = (muted: boolean) => {
    if (currentPlayerRef.current) {
      currentPlayerRef.current.muted = muted;
    }
  };

  const isMuted = () => {
    return currentPlayerRef.current ? currentPlayerRef.current.muted : false;
  };

  const playVideo = () => {
    if (currentPlayerRef.current) {
      currentPlayerRef.current.play();
    }
  };

  const pauseVideo = () => {
    if (currentPlayerRef.current && typeof currentPlayerRef.current.pause === 'function') {
      currentPlayerRef.current.pause();
    }
  };

  const release = () => {
    if (currentPlayerRef.current) {
      currentPlayerRef.current.release();
    }
  };

  const clearPlayer = () => {
    currentPlayerRef.current = undefined;
  };

  return (
    <VideoPlayerContext.Provider
      value={{
        pauseVideo,
        getPlayer,
        clearPlayer,
        toggleAudioMute,
        handlerTime,
        playVideo,
        isMuted,
        player: currentPlayerRef.current as any,
        setPlayer,
        release,
      }}
    >
      {children}
    </VideoPlayerContext.Provider>
  );
};

export const useVideoPlayerContext = () => {
  const context = useContext(VideoPlayerContext);
  if (!context) {
    throw new Error(
      "useVideoPlayerContext must be used within a VideoPlayerProvider"
    );
  }
  return context;
};
