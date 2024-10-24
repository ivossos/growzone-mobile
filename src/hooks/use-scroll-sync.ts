import { FlatListProps } from "react-native";
import { RefObject } from "react";
import { FlatList } from "react-native";
import Animated from "react-native-reanimated";

export type HeaderConfig = {
  heightExpanded: number;
  heightCollapsed: number;
};

export type ScrollPair = {
  list: RefObject<FlatList>;
  position: Animated.SharedValue<number>;
};

const useScrollSync = (
  scrollPairs: ScrollPair[],
  headerConfig: HeaderConfig
) => {
  const sync: NonNullable<FlatListProps<any>["onMomentumScrollEnd"]> = (
    event
  ) => {
    const { y } = event.nativeEvent.contentOffset;

    const { heightCollapsed, heightExpanded } = headerConfig;

    const headerDiff = heightExpanded - heightCollapsed;

    for (const { list, position } of scrollPairs) {
      const scrollPosition = position.value ?? 0;

      if (scrollPosition > headerDiff && y > headerDiff) {
        continue;
      }

      list.current?.scrollToOffset({
        offset: Math.min(y, headerDiff),
        animated: false,
      });
    }
  };

  return { sync };
};

export default useScrollSync;