import { socialApi } from "@/lib/axios";
import { GrowPostDetail, TimelineParams } from "@/api/@types/models";

export async function getAllGrowPost({ userId, ...rest }: Pick<TimelineParams, 'limit' | 'userId' | 'skip'>) {
  const response = await socialApi.get<Array<GrowPostDetail>>(
    `/detailed-grow-post/all/${userId}`,
    {
      params: rest,
    }
  );

  return response.data;
}
