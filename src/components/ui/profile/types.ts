import { TimelineType } from "@/api/@types/enums";
import {
  GrowPost,
  GrowPostDetail,
  PostDetail,
  ReelsDetail,
  SocialPost,
} from "@/api/@types/models";
import { RefObject } from "react";
import { FlatList } from "react-native";
import Animated from "react-native-reanimated";

export type ScrollPair = {
  list: RefObject<FlatList>;
  position: Animated.SharedValue<number>;
};

export type Connection = {
  photo: string;
  name: string;
};

export type HeaderConfig = {
  heightExpanded: number;
  heightCollapsed: number;
};

export enum Visibility {
  Hidden = 0,
  Visible = 1,
}

export interface TabData {
  isActive: boolean;
  icon: React.JSX.Element;
  value: TimelineType;
}

export type ItemData = PostDetail | ReelsDetail | GrowPostDetail;
