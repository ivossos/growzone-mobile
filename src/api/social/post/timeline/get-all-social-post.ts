import { socialApi } from "@/lib/axios";
import { PostDetail, TimelineParams } from "@/api/@types/models";

export async function getAllSocialPost({ userId, ...rest }: Pick<TimelineParams, 'limit' | 'userId' | 'skip'>) {
  const response = await socialApi.get<Array<PostDetail>>(
    `/detailed-social-post/all/${userId}`,
    {
      params: rest,
    }
  );

  return response.data;
}
