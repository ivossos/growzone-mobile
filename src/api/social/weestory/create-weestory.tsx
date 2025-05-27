import { socialApi } from "@/lib/axios";

import { getAuthenticatedUrl } from "../../mux/get-authenticated-url";

async function uploadVideoToUrl(
  fileUri: string,
  uploadUrl: string
): Promise<void> {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", blob.type);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload falhou com status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Erro no upload"));
    };

    xhr.send(blob);
  });
}

export async function createWeestory({ image, video }: any) {
  const formData = new FormData();

  if (image) {
    formData.append("image", {
      uri: image,
      type: "image/png",
      name: image.fileName || image.split("/").pop(),
    } as unknown as File);
  }

  if (video) {
    const { message } = await getAuthenticatedUrl();
    await uploadVideoToUrl(video, message.url);
    formData.append("video", message.id);
  }

  const response = await socialApi.post(`/new-story-post/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}
