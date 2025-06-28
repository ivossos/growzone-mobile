import { socialApi } from "@/lib/axios";
import { getAuthenticatedUrl } from "../../mux/get-authenticated-url";

/**
 * Uploads a video file to a given URL using an XMLHttpRequest.
 *
 * @param {string} fileUri - The URI of the video file to be uploaded.
 * @param {string} uploadUrl - The URL to which the video will be uploaded.
 * @param {Function} [onProgress] - Optional callback function that receives the upload progress as a percentage (0-100).
 * @returns {Promise<void>} A promise that resolves when the upload is complete or rejects if an error occurs.
 *
 * The function fetches the video file as a blob and uses XMLHttpRequest to upload it. The upload progress is tracked
 * and reported via the onProgress callback, if provided. The promise resolves on successful upload and rejects
 * if an error occurs, including network errors or timeouts.
 */

async function uploadVideoToUrl(
  fileUri: string,
  uploadUrl: string,
  onProgress?: (progress: number) => void
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl, true);

    // Progress tracking
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(Math.round(percentComplete));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Upload falhou com status ${xhr.status}`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Erro no upload"));
    };

    xhr.ontimeout = () => {
      reject(new Error("Upload timeout - tente novamente"));
    };

    // Upload direto via fetch para obter o blob e enviar ao Mux
    fetch(fileUri)
      .then((response) => response.blob())
      .then((blob) => {
        // Definir o content-type correto para vídeo
        xhr.setRequestHeader("Content-Type", blob.type || "video/mp4");
        xhr.send(blob);
      })
      .catch((error) => {
        reject(new Error(`Erro ao processar arquivo: ${error.message}`));
      });
  });
}

/**
 * Cria um novo weestory com imagem e/ou vídeo.
 *
 * @param {Object} options
 * @param {string} [options.image] URL da imagem a ser enviada.
 * @param {string} [options.video] URL do vídeo a ser enviado.
 * @param {Function} [options.onProgress] Função chamada com o progresso do upload (0-100) e uma mensagem opcional.
 */
export async function createWeestory({
  image,
  video,
  onProgress,
}: {
  image: string | undefined | null;
  video: string | undefined | null;
  onProgress?: (progress: number, message: string) => void;
}) {
  try {
    onProgress?.(10, "Preparando upload...");

    const formData = new FormData();

    if (!image && !video) {
      throw new Error("Nenhuma mídia capturada");
    }

    if (image) {
      const nameImage = image ? image.split("/").pop() : "";
      formData.append("image", {
        uri: image,
        type: "image/png",
        name: image ?? nameImage,
      } as unknown as File);
    }

    if (video) {
      console.log("📹 Iniciando upload de vídeo para Mux:", video);
      onProgress?.(20, "Obtendo URL de upload...");
      const { message } = await getAuthenticatedUrl();
      console.log("🔗 URL obtida do Mux:", message.url);

      onProgress?.(30, "Iniciando upload do vídeo...");
      await uploadVideoToUrl(video, message.url, (progress) => {
        // Progress do vídeo representa 60% do total (30-90%)
        const totalProgress = 30 + progress * 0.6;
        onProgress?.(totalProgress, `Uploading vídeo... ${progress}%`);
      });

      console.log("✅ Upload para Mux concluído. ID:", message.id);
      formData.append("video", message.id);
    }

    onProgress?.(90, "Finalizando weestory...");
    const response = await socialApi.post(`/new-story-post/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    onProgress?.(100, "Weestory publicado com sucesso!");
    console.log("🎉 Weestory criado com sucesso!");
    return response.data;
  } catch (error) {
    console.error("❌ Erro no upload do weestory:", error);
    throw error;
  }
}
