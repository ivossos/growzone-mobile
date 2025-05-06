import { socialApi } from "@/lib/axios";

interface GetWeestoryProps {
  userId: number;
  skip?: number;
  limit?: number;
}

export async function getWeestory({
  userId,
  skip = 0,
  limit = 100,
}: GetWeestoryProps) {
  const followResponse = await socialApi.get<[]>(`follow/following/${userId}`, {
    params: {
      skip,
      limit,
    },
  });

  const followers = followResponse.data;

  const storyFetches = followers.map(async (item: any) => {
    const follower = item.followed;

    const storyRes = await socialApi.get(`/listed-story-post/${follower.id}`, {
      params: { skip, limit },
    });

    const stories = storyRes.data.map((story: any) => ({
      postId: story.post_id,
      type: story.file.type,
      uri: story.file.file,
    }));

    return {
      id: String(follower.id),
      name: follower.name,
      username: follower.username,
      avatar: follower.image,
      stories,
    };
  });

  const allUsers = await Promise.all(storyFetches);

  const usersWithStories = allUsers.filter((user) => user.stories.length > 0);

  return usersWithStories;
}
