import { ReelsDetail } from "@/api/@types/models";
import { VideoContentFit, VideoPlayer } from "expo-video";
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

// export interface VideoPlayerProps {
//   source: { uri: string };
//   data?: any;
//   autoplay?: boolean;
//   resizeMode?: VideoContentFit;
//   startPlay?: (value: any) => void;
//   styleContainer?: StyleProp<ViewStyle>;
//   muted?: boolean;
//   loop?: boolean;
//   controls?: Partial<{
//     showProgressBar: boolean;
//     showMutedButton: boolean;
//     handlerMutedVideo: () => void;
//     muted: boolean;
//   }>;
// }

export type ReelsPostProps = {
  post: ReelsDetail;
  activePostId: number | null;
  video: VideoPlayerProps;
};
