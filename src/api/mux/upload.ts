import { getAuthenticatedUrl } from "./get-authenticated-url";
import { queryClient } from "@/lib/react-query";
import createNewSocialPost from "../social/post/create-new-social-post";
import createNewReels from "../social/post/create-new-reels";
import createNewGrowPost from "../social/post/create-new-grow-post";
import * as FileSystem from "expo-file-system";

export type FilePost = { uri: string; fileName: string; type: string };

async function uploadVideoToUrl(
  fileUri: string,
  uploadUrl: string,
  onProgress: (progress: number) => void
): Promise<void> {
  try {
    const uploader = FileSystem.createUploadTask(
      uploadUrl,
      fileUri,
      {
        httpMethod: "PUT",
        uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
        headers: {
          "Content-Type": "video/mp4",
        },
      },
      (uploadProgress) => {
        const progress =
          uploadProgress.totalBytesSent /
          uploadProgress.totalBytesExpectedToSend;
        onProgress(Math.round(progress * 100));
      }
    );

    const result = await uploader.uploadAsync();

    if (result && result.status >= 200 && result.status < 300) {
      onProgress(100);
    } else {
      throw new Error(`Upload failed with status ${result?.status}`);
    }
  } catch (error) {
    console.error("Upload error:", error);
    throw new Error("Error during upload");
  }
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
    let totalSteps = videos.length > 0 ? videos.length + 2 : 1;
    let completedSteps = 0;

    let videoUploadData: { uploadId: string; uploadUrl: string }[] = [];

    if (videos.length > 0) {
      videoUploadData = await Promise.all(
        videos.map(async () => {
          const { message } = await getAuthenticatedUrl();
          return { uploadId: message.id, uploadUrl: message.url };
        })
      );
    }

    const uploadIds = videoUploadData.map((data) => data.uploadId);
    await createPostFn({ images, videos: uploadIds, description });

    completedSteps++;
    onProgress((completedSteps / totalSteps) * 100);

    if (videoUploadData.length > 0) {
      for (let i = 0; i < videos.length; i++) {
        const { uploadUrl } = videoUploadData[i];

        await uploadVideoToUrl(videos[i].uri, uploadUrl, (progress) => {
          const progressFromCurrentVideo =
            (progress / 100) * (100 / totalSteps);
          onProgress(
            completedSteps * (100 / totalSteps) + progressFromCurrentVideo
          );
        });

        completedSteps++;
        onProgress((completedSteps / totalSteps) * 100);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    queryClient.invalidateQueries({ queryKey: ["profile", userId.toString()] });
    queryClient.invalidateQueries({ queryKey: [queryKey, userId.toString()] });

    completedSteps++;
    onProgress(100);
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
      createPostFn: ({ videos, ...props }) =>
        createNewReels({ ...props, video: videos[0] }),
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
      createPostFn: (data) =>
        createNewGrowPost({ ...data, day, strain_id, phase_id }),
      queryKey: "profile-post-grow",
    });
  } catch (error) {
    console.error("Erro ao processar grow post:", error);
    throw error;
  }
}
