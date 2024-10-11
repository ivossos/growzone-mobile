import { FlatList, Image, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SocialPost } from "@/api/@types/models";
import { Video } from "expo-av";


const numColumns = 3;
const w = Dimensions.get("window").width;

type PostGridProps = {
  posts: SocialPost[]
}

export default function PostGrid({ posts }: PostGridProps) {
  const renderItem = ({ item }: { item: SocialPost}) => {
    return (
      <TouchableOpacity onPress={() => router.push(`/post/${item.post_id}`)} className="mb-1" >
          {item?.file?.type === 'image' ? (
        <Image source={{ uri: item?.file?.file }} style={styles.image} resizeMode="cover" />
      ) : (
          <Video
            source={{ uri: item?.file?.file }}
            style={styles.image}
            shouldPlay={false}
            isLooping={false}
            useNativeControls
          />
      )}
      </TouchableOpacity>
    )
};

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      columnWrapperClassName="flex gap-1"
      scrollEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: w / numColumns - 3,
    height: 120,
  },
  column: {
    justifyContent: "space-between",
  },
});
