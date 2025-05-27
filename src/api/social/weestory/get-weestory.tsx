import { socialApi } from "@/lib/axios";

interface GetWeestoryProps {
  skip?: number;
  limit?: number;
}

function isStoryExpired(createdAt: string): boolean {
  const postDate = new Date(createdAt).getTime();
  const now = Date.now();
  const diffInHours = (now - postDate) / (1000 * 60 * 60);
  return diffInHours > 24;
}

export async function getWeestory({ skip = 0, limit = 100 }: GetWeestoryProps) {
  try {
    const userResponse = await socialApi.get("/user/");

    const followResponse = await socialApi.get<[]>(
      `follow/following/${userResponse.data.id}`,
      {
        params: {
          skip,
          limit,
        },
      }
    );

    const followers = followResponse.data as any;

    followers.unshift({
      followed: {
        id: userResponse.data.id,
        image: userResponse.data.image,
        name: userResponse.data.name,
        username: userResponse.data.username,
      },
    });

    const storyFetches = followers.map(async (item: any) => {
      const follower = item.followed;

      const storyRes = await socialApi.get(
        `/listed-story-post/${follower.id}`,
        {
          params: { skip, limit },
        }
      );

      const stories = storyRes.data
        .filter(
          (item: { file: { file: any; created_at: string } }) =>
            item.file && item.file.file && !isStoryExpired(item.file.created_at)
        )
        .map((story: any) => ({
          postId: story.post_id,
          type: story.file.type,
          uri: story.file.file,
          createdAt: story.file.created_at,
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
  } catch (error) {
    return [];
  }
}
