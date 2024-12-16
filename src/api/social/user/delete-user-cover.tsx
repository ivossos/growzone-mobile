import { socialApi } from "@/lib/axios";
import { CreateUserCover } from "@/api/@types/models";

export async function deleteUserCover() {
  const response = await socialApi.delete<CreateUserCover>("/user-cover/");

  return response.data;
}
