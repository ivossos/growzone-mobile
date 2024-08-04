import Button from "@/components/ui/button";
import { ArrowBigDown, ArrowBigLeft } from "lucide-react-native";
import { View, ScrollView } from "react-native";

export default function CommunityScreen() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Button
          handlePress={() => console.log(`Pressed`)}
          containerStyles="mt-7"
          title="testeeee"
          textStyles="mt"
          isLoading={false}
          rightIcon={ArrowBigDown}
        />

        <Button
          handlePress={() => console.log(`Pressed`)}
          containerStyles="mt-7"
          title="testeeee"
          textStyles="mt"
          isLoading={false}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
}
