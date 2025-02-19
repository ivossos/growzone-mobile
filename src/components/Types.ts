import { ReelsDetail } from "@/api/@types/models";
import { VideoContentFit, VideoPlayer } from "expo-video";
import React from "react";
import { StyleProp, ViewStyle } from "react-native";

export interface VideoPlayerProps {
  player: VideoPlayer;
  startPlay?: (value: any) => void;
  styleContainer?: StyleProp<ViewStyle>;
  data?: any;
  autoplay?: boolean;
  resizeMode?: VideoContentFit;
  muted?: boolean;
  loop?: boolean;
  controls?: Partial<{
    showProgressBar: boolean;
    handlerMutedVideo: () => void;
    showButtonPlay: boolean;
  }>;
}

export type ReelsPostProps = {
  post: ReelsDetail;
  children: React.ReactNode;
};
