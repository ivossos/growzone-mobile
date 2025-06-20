import { View, Text, TouchableOpacity } from "react-native";

export default function ReportModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <View className="bg-black-100 px-6 py-6 rounded-lg w-full">
      <Text className="text-white text-base font-semibold mb-2">
        Are you sure you want to report this post?
      </Text>

      <Text className="text-black-50 text-sm mb-6">
        Your report will be submitted and reviewed by our team.
      </Text>

      <TouchableOpacity
        onPress={onConfirm}
        className="bg-[#32CD32] py-3 rounded-lg items-center mb-3"
      >
        <Text className="text-black font-semibold text-base">Report</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCancel}
        className="border border-black-50 py-3 rounded-lg items-center"
      >
        <Text className="text-black-50 font-medium text-base">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
