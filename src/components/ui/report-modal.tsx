import { View, Text, TouchableOpacity } from "react-native";

export default function ReportModal({ onCancel }: { onCancel: () => void}) {
  return (
    <View className="bg-black-100 px-6 py-6 rounded-lg w-full">
      <Text className="text-white text-base font-semibold mb-2">
        Are you sure you want to report this post?
      </Text>

      <Text className="text-black-50 text-sm mb-6">
        Your report will be submitted and reviewed by our team.
      </Text>

      <TouchableOpacity
        onPress={onCancel}
        className="bg-[#32CD32] py-3 rounded-lg items-center"
      >
        <Text className="text-black-50 font-medium text-base">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
