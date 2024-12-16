import React, {
  Fragment,
  MutableRefObject,
  ReactElement,
  memo,
  useEffect,
  useState,
} from "react";
import {
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";

type Props<T> = {
  data: T[];
  innerRef?: MutableRefObject<ScrollView | null>;
  ListHeaderComponent?: React.ReactNode | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponentStyle?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  renderItem: ({ item, i }: { item: T; i: number }) => ReactElement;
  loading?: boolean;
  LoadingView?: React.ComponentType<any> | React.ReactElement | null;
  numColumns?: number;
  horizontal?: boolean;
  keyExtractor?: ((item: T | any, index: number) => string) | undefined;
  style?: StyleProp<ViewStyle>;
};

function MasonryList<T>(props: Props<T>) {
  const {
    data,
    innerRef,
    ListHeaderComponent,
    ListEmptyComponent,
    ListFooterComponent,
    ListHeaderComponentStyle,
    containerStyle,
    renderItem,
    loading,
    LoadingView,
    numColumns = 2,
    horizontal,
    keyExtractor,
    style,
  } = props;
  const [cols, setCols] = useState<
    Array<{ bricks: Array<T>; colHeight: number }>
  >(
    Array(numColumns)
      .fill(numColumns)
      .map((_) => ({ bricks: [], colHeight: 0 }))
  );

  const processImage = async () => {
    const processedImages = [...data];
  
    const getImageSizeAsync = (uri: string): Promise<{ width: number; height: number }> => {
        return new Promise((resolve, reject) => {
          Image.getSize(
            uri,
            (width, height) => resolve({ width, height }),
            (error) => reject(error)
          );
        });
      };
  
    for (let i = 0; i < data.length; i++) {
      const item: any = processedImages[i];
      try {
        const { width, height } = await getImageSizeAsync(item.uri);
  
        processedImages[i] = { ...item, width: Math.min(500, width), height: Math.min(500, height) };
      } catch (error) {
        console.error("Error getting image size:", error);
      }
    }
  
    return await layoutBricks(processedImages);
  };

  const layoutBricks = async (data: Array<T>) => {
    const newCols = [...cols];

    data.forEach((image: any) => {
      let ht = image.height;

      const heights = newCols.map(({ colHeight }) => colHeight);
      const shortestColumnIndex = heights.findIndex(
        (colH) => colH === Math.min.apply(Math, heights)
      );
      const shortestColumn = newCols[shortestColumnIndex];

      newCols[shortestColumnIndex] = {
        bricks: [...shortestColumn.bricks, image],
        colHeight: shortestColumn.colHeight + ht,
      };
    });

    setCols(newCols);
  };

  useEffect(() => {
    processImage();
  }, []);

  return (
    <View ref={innerRef} style={containerStyle}>
      <Fragment>
        <View style={ListHeaderComponentStyle}>{ListHeaderComponent}</View>
        {data.length === 0 && ListEmptyComponent ? (
          React.isValidElement(ListEmptyComponent) ? (
            ListEmptyComponent
          ) : (
            // @ts-ignore
            <ListEmptyComponent />
          )
        ) : (
          <View
            style={[
              styles.masonryContainer,
              {
                flexDirection: horizontal ? "column" : "row",
              },
              style,
            ]}
          >
            {cols.map(({ bricks }, index) => {
              const uniqueBricks = [...new Set(bricks)];
              return (
                <View
                  key={`masonry-column-${index}`}
                  style={{
                    flex: 1 / numColumns,
                    flexDirection: horizontal ? "row" : "column",
                  }}
                >
                  {uniqueBricks.map((b, num) => {
                    return renderItem({ item: b, i: num });
                  })}
                </View>
              );
            })}
          </View>
        )}

        {loading &&
          (React.isValidElement(LoadingView) ? (
            LoadingView
          ) : LoadingView ? (
            // @ts-ignore
            <LoadingView />
          ) : null)}

        {ListFooterComponent &&
          (React.isValidElement(ListFooterComponent) ? (
            ListFooterComponent
          ) : (
            // @ts-ignore
            <ListFooterComponent />
          ))}
      </Fragment>
    </View>
  );
}

const styles = StyleSheet.create({
  masonryContainer: {
    flex: 1,
  },
});

export default memo(MasonryList);
