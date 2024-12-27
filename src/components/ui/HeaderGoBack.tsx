import { colors } from "@/styles/colors";
import { ArrowLeft } from "lucide-react-native";
import { Text, TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle } from "react-native";

interface ButtonHeader {
  onBack: () => void;
  title?: string;
  containerStyle?: StyleProp<ViewStyle>
}

export default function HeaderGoBack({
  onBack,
  containerStyle,
  title,
}: ButtonHeader) {
  const containerViewStyle = containerStyle ? containerStyle : styles.default;

  return (
    <View style={containerViewStyle}>
      <TouchableOpacity onPress={onBack}>
        <View style={styles.row}>
          <ArrowLeft width={32} height={32} color={colors.brand.white} />
          {title && <Text style={styles.headerText}>{title}</Text>}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  default: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: colors.brand.black[80],
    backgroundColor: '#0D0D0D',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerText: {
    color: colors.brand.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
