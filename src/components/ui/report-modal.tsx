import { View, Text, TouchableOpacity } from "react-native";

interface ReportModalProps {
  title?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
}

export default function ReportModal({
  title = "Confirmation",
  description = "Are you sure you want to proceed with this action?",
  primaryLabel = "Confirm",
  secondaryLabel = "Cancel",
  onPrimary,
  onSecondary,
}: ReportModalProps) {
  return (
    <View className="bg-black-100 px-6 py-6 rounded-lg w-full">
      <Text className="text-white text-base font-semibold mb-2">
        {title}
      </Text>

      <Text className="text-black-50 text-sm mb-6">
        {description}
      </Text>

      {onSecondary && (
        <TouchableOpacity
          onPress={onSecondary}
          className="border border-black-50 py-3 rounded-lg items-center mb-3"
        >
          <Text className="text-black-50 font-medium text-base">
            {secondaryLabel}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        onPress={onPrimary}
        className="bg-[#32CD32] py-3 rounded-lg items-center"
      >
        <Text className="text-black font-medium text-base">
          {primaryLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
