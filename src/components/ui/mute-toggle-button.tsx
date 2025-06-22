// components/ui/MuteToggleButton.tsx
import { usePlayerContext } from "@/context/player-context";
import { colors } from "@/styles/colors";
import { Volume2, VolumeX } from "lucide-react-native";
import { TouchableOpacity } from "react-native";

export default function MuteToggleButton() {
  const { isMuted, toggleMute } = usePlayerContext();

  return (
    <TouchableOpacity
      onPress={toggleMute}
      style={{
        backgroundColor: colors.brand.white,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 999,
      }}
    >
      {isMuted ? (
        <VolumeX size={20} color={colors.brand.black} />
      ) : (
        <Volume2 size={20} color={colors.brand.black} />
      )}
    </TouchableOpacity>
  );
}
