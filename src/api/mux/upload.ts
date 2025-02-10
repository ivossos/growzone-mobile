import { getAuthenticatedUrl } from "./get-authenticated-url";
import { queryClient } from "@/lib/react-query";
import createNewSocialPost from "../social/post/create-new-social-post";
import getVideoUrl from "./get-video-url";
import createNewReels from "../social/post/create-new-reels";
import createNewGrowPost from "../social/post/create-new-grow-post";


export type FilePost = { uri: string; fileName: string; type: string };

async function uploadVideo(fileUri: string, onProgress: (progress: number) => void): Promise<{ uploadId: string }> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { message } = await getAuthenticatedUrl();
  const uploadUrl = message.url;
  const uploadId = message.id;

  await fetch(uploadUrl, {
    method: "PUT",
    body: blob,
    headers: { "Content-Type": blob.type },
  });

  return { uploadId };
}

async function uploadVideos(videos: FilePost[], onProgress: (progress: number) => void): Promise<string[]> {
  const totalSteps = videos.length + 2;
  let completedSteps = 0;

  const uploadPromises = videos.map(async (video) => {
    const { uploadId } = await uploadVideo(video.uri, (progress) => {
      const progressFromCurrentVideo = (progress / 100) * (100 / totalSteps);
      onProgress(completedSteps * (100 / totalSteps) + progressFromCurrentVideo);
    });

    completedSteps++;
    onProgress((completedSteps / totalSteps) * 100);

    return uploadId;
  });

  const uploadIds = await Promise.all(uploadPromises);
  completedSteps++;
  onProgress((completedSteps / totalSteps) * 100);

  return uploadIds;
}

async function processPost({
  userId,
  images,
  videos,
  description,
  onProgress,
  createPostFn,
  queryKey,
}: {
  userId: number;
  images: FilePost[];
  videos: FilePost[];
  description?: string;
  onProgress: (progress: number) => void;
  createPostFn: (data: any) => Promise<any>;
  queryKey: string;
}): Promise<void> {
  try {
    let videoUrls: string[] = [];
    let totalSteps = videos.length > 0 ? videos.length + 2 : 1;
    let completedSteps = 0;

    if(videos.length > 0) {
      const uploadIds = await uploadVideos(videos, onProgress);

      const { message } = await getVideoUrl({ uploadIds });
      videoUrls = message;

      completedSteps++;
      onProgress((completedSteps / totalSteps) * 100);
    }

    await createPostFn({ images, videos: videoUrls, description });

    queryClient.invalidateQueries({ queryKey: ["profile", userId.toString()] });
    queryClient.invalidateQueries({ queryKey: [queryKey, userId.toString()] });

    completedSteps++;
    onProgress(98)
  } catch (error) {
    console.error("Erro no processamento do post:", error);
    throw error;
  }
}

export async function processSocial({
  userId,
  images,
  videos,
  description,
  onProgress,
}: {
  userId: number;
  images: FilePost[];
  videos: FilePost[];
  description: string;
  onProgress: (progress: number) => void;
}): Promise<void> {
  try {
    await processPost({
      userId,
      images,
      videos,
      description,
      onProgress,
      createPostFn: createNewSocialPost,
      queryKey: "profile-posts",
    });
  } catch (error) {
    console.error("Erro ao processar post social:", error);
    throw error;
  }
}

export async function processReels({
  userId,
  video,
  description,
  onProgress,
}: {
  userId: number;
  video: FilePost;
  description?: string;
  onProgress: (progress: number) => void;
}): Promise<void> {
  try {
    await processPost({
      userId,
      images: [],
      videos: [video],
      description,
      onProgress,
      createPostFn: createNewReels,
      queryKey: "profile-reels",
    });
  } catch (error) {
    console.error("Erro ao processar reels:", error);
    throw error;
  }
}

export async function processGrow({
  userId,
  images,
  videos,
  description,
  day,
  strain_id,
  phase_id,
  onProgress,
}: {
  userId: number;
  images: FilePost[];
  videos: FilePost[];
  description: string;
  day: number;
  strain_id: number;
  phase_id: number;
  onProgress: (progress: number) => void;
}): Promise<void> {
  try {
    await processPost({
      userId,
      images,
      videos,
      description,
      onProgress,
      createPostFn: (data) => createNewGrowPost({ ...data, day, strain_id, phase_id }),
      queryKey: "profile-post-grow",
    });
  } catch (error) {
    console.error("Erro ao processar grow post:", error);
    throw error;
  }
}
