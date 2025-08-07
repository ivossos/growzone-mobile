import { socialApi } from "@/lib/axios";
import { UserSocial } from "@/api/@types/models";

export async function getCurrentUser(headers = {}) {
  const response = await socialApi.get<UserSocial>("/user/", { headers });
  return response.data;
}
