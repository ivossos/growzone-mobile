import { TouchableOpacity, Text } from "react-native";
import { router } from "expo-router";

interface EditProfileUserProps {
  userId: number
}

export function EditProfileButton({ userId }: EditProfileUserProps) {

  const handlerOpenScreenEditUser = () => {
    router.push({ pathname: "/user/[userId]/edit", params: { userId } });
  }

  return (
    <TouchableOpacity
      onPress={handlerOpenScreenEditUser}
      className="flex flex-row items-center justify-center flex-1 gap-2 px-3 py-1 bg-black-80 rounded-[64px] h-12"
    >
      <Text className="text-base text-neutral-400">Editar perfil</Text>
    </TouchableOpacity>
  );
}
