import { socialApi } from "@/lib/axios";

interface GetVideoUrlBody {
  uploadIds: string[];
}

type GetVideoUrlResponse = {
  status: boolean;
  message: string[];
}


export default async function getVideoUrl({ uploadIds }: GetVideoUrlBody) {
  const formData = new FormData();
  uploadIds.forEach((uploadId) => {
    formData.append("id", uploadId);
  });

  const response = await socialApi.post<GetVideoUrlResponse>('/mux/get-video-asset', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}
