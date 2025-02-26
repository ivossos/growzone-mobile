import { socialApi } from "@/lib/axios";
import { ReelsDetail, TimelineParams } from "@/api/@types/models";

export async function getAllWeedzPost({
  userId,
  ...rest
}: Pick<TimelineParams, "limit" | "userId" | "skip">) {
  const response = await socialApi.get<Array<ReelsDetail>>(
    `/detailed-reel-post/all/${userId}`,
    {
      params: rest,
    }
  );

  return response.data;
}
