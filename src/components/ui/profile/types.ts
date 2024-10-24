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