import { postsMock } from "@/constants/mock";
import { removeQueryString } from "@/lib/utils";
import { FlatList, Image, StyleSheet, View, Dimensions, TouchableOpacity } from "react-native";
import { Post } from "./post-card";
import { router } from "expo-router";


const numColumns = 3;
const w = Dimensions.get("window").width;

export default function PostGrid() {
  const renderItem = ({ item }: { item: Post}) => {
    console.log('-> ', item)
    const image = item?.media?.find(m => m.type === 'image');
    
    console.log(image)
    if(!image) return;

    return (
      <TouchableOpacity onPress={() => router.push('/post/1')} className="mb-1" >
        <Image src={image.file!} style={styles.image} resizeMode="cover" />
      </TouchableOpacity>
    )
};

  return (
    <FlatList
      data={postsMock}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      numColumns={numColumns}
      columnWrapperClassName="flex gap-1"
      scrollEnabled={false}
      row
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
