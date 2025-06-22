import { router } from "expo-router";
import { Text, TouchableOpacity } from "react-native";

export function EditProfileButton() {
  const handlerOpenScreenEditUser = () => {
    router.push({ pathname: "/profile/edit" });
  };

  return (
    <TouchableOpacity
      onPress={handlerOpenScreenEditUser}
      className="flex flex-row items-center justify-center gap-2 px-3 py-1 bg-black-80 rounded-[64px] h-12"
      style={{ width: "100%" }}
    >
      <Text className="text-base text-neutral-400">Editar perfil</Text>
    </TouchableOpacity>
  );
}
