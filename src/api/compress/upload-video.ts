import { compressApi } from "@/lib/axios";
import { DefaultResponse } from "../@types/models";

export async function uploadVideo(postId: number, video: {uri: string; fileName: string, type: string}) {
  const fileBlob = await fetch(video.uri);
  const fileBuffer = await fileBlob.blob();

  const response = await compressApi<DefaultResponse>({
    method: 'POST',
    url: `/videos/${postId}`, 
    headers: {
      'Content-Type': video.type,
    },
    data: fileBuffer,
    transformRequest: [(data, headers) => {
      return data;
    }],
    responseType: 'json',
  });

  return response.data;
}