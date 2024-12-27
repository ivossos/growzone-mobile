// import 'react-native-get-random-values';
// import 'react-native-url-polyfill/auto';
// import '@aws-sdk/util-endpoints'




// import { s3Client } from '@/lib/aws-s3';
// import { PutObjectCommand } from '@aws-sdk/client-s3';
// import RNFS from 'react-native-fs';
// import { FFmpegKit } from 'ffmpeg-kit-react-native';
// import { v4 as uuidv4 } from 'uuid';


// import { Buffer } from 'buffer'; 
// import createNewSocialPost from '../social/post/create-new-social-post';
// import { queryClient } from '@/lib/react-query';
// import createNewGrowPost from '../social/post/create-new-grow-post';
// import createNewReels from '../social/post/create-new-reels';
// global.Buffer = Buffer;

// type PostType = 'grow' | 'reel' | 'social' | 'story';

// interface UploadVideoToS3Props {
//   postType: PostType;
//   folderPath: string;
// }

// export async function createThumbnail(inputPath: string): Promise<string> {
//   const fileName = inputPath.split('/').pop()!;
//   const outputPath = `${RNFS.DocumentDirectoryPath}/tmb_${fileName.split('.')[0]}.webp`;
//   const command = `-i ${inputPath} -ss 00:00:00 -vframes 1  ${outputPath}`;

//   const process = await FFmpegKit.execute(command);

//   if (!(await process.getReturnCode()).isValueSuccess()) {
//     throw new Error('ffmpeg failed to create thumbnail');
//   }

//   console.log('createThumbnail', outputPath);

//   return outputPath;
// }

// export async function compressVideo(inputPath: string): Promise<string> {
//   const fileName = inputPath.split('/').pop()!;
//   const outputPath = `${RNFS.DocumentDirectoryPath}/cps_${fileName.split('.')[0]}.mp4`;
//   const command = `-i "${inputPath}" -vcodec libx264 -acodec aac -preset veryfast -crf 26 -f mp4 "${outputPath}"`;

//   const process = await FFmpegKit.execute(command);

//   if (!(await process.getReturnCode()).isValueSuccess()) {
//     throw new Error('ffmpeg failed to compress video');
//   }
  
//   return outputPath;
// }

// export async function transformVideo(inputPath: string, thumbnailPath: string, outputDir: string): Promise<string> {
//   await RNFS.mkdir(outputDir);

//   const outputPath = `${outputDir}/output.m3u8`;
//   const segmentPath = `${outputDir}/segment_%03d.ts`;
//   const command = `-i ${inputPath} -vcodec libx264 -acodec aac -hls_time 4 -hls_list_size 0 -hls_segment_filename ${segmentPath} -hls_playlist_type vod ${outputPath}`;

//   const process = await FFmpegKit.execute(command);

//   if (!(await process.getReturnCode()).isValueSuccess()) {
//     throw new Error('ffmpeg failed to transform video');
//   }

//   await RNFS.moveFile(thumbnailPath, `${outputDir}/thumbnail.webp`);

//   return outputPath;
// }

// async function uploadToS3({ postType, folderPath }: UploadVideoToS3Props): Promise<string> {

//   const uniqueFolder = `${postType}_post_files/${uuidv4()}`;
//   const folderBucket = `media/${uniqueFolder}`;

//   try {
//     const files = await RNFS.readDir(folderPath);
//     for (const file of files) {
//       if (file.isFile()) {
//         await uploadWithRetry(file, folderBucket, 3);
//       }
//     }

//     return `${uniqueFolder}/output.m3u8`;
//   } catch (error) {
//     console.error('Erro ao fazer upload para o S3:', error);
//     throw new Error('Erro ao fazer upload dos arquivos para o S3');
//   }
// }

// async function uploadWithRetry(file: RNFS.ReadDirItem, folderBucket: string, retries: number): Promise<void> {
//   let attempts = 0;
//   while (attempts < retries) {
//     try {
//       const fileContent = await RNFS.readFile(file.path, 'base64');
//       const fileContentBuffer = Buffer.from(fileContent, 'base64');

//       const uploadParams = {
//         Bucket: process.env.EXPO_PUBLIC_AWS_STORAGE_BUCKET_NAME,
//         Key: `${folderBucket}/${file.name}`,
//         Body: fileContentBuffer,
//         ContentType: getMimeType(file.name),
//       };

//       console.log(`Tentativa de upload do arquivo: ${file.name}, tentativa ${attempts + 1}`);
//       await s3Client.send(new PutObjectCommand(uploadParams));
//       console.log(`Arquivo enviado com sucesso: ${file.name}`);
//       return;
//     } catch (error) {
//       attempts++;
//       console.error(`Erro ao fazer upload do arquivo ${file.name}, tentativa ${attempts}:`, error);

//       if (attempts >= retries) {
//         console.error(`Falha ao fazer upload do arquivo ${file.name} após ${retries} tentativas.`);
//         throw new Error(`Falha ao enviar arquivo ${file.name} para o S3.`);
//       }
//     }
//   }
// }

// export async function processVideo(inputPath: string, postType: PostType, onProgress: (progress: number) => void) {
//   let thumbnailPath: string | undefined;
//   let compressedVideoPath: string | undefined;
//   const outputDir = `${RNFS.DocumentDirectoryPath}/${uuidv4()}`;

//   try {
//     onProgress(5)
//     thumbnailPath = await createThumbnail(inputPath);
//     onProgress(10)

//     compressedVideoPath = await compressVideo(inputPath);
//     onProgress(50)
//     const hlsPath = await transformVideo(compressedVideoPath, thumbnailPath, outputDir);
//     onProgress(75)
    
//     console.log('HLS Playlist Path:', hlsPath);
    
//     const s3FileDir = await uploadToS3({ folderPath: outputDir, postType});
//     onProgress(90)

//     return { hlsPath, thumbnailPath, s3FileDir }
//   } catch (error) {
//     console.error('Error processing video:', error);
//     throw new Error('Error processing video');
//   } finally {
//     if (compressedVideoPath) {
//       await RNFS.unlink(compressedVideoPath).catch(() => {
//         console.warn('Failed to remove compressed video');
//       });
//     }

//     if (outputDir) {
//       await RNFS.unlink(outputDir).catch(() => {
//         console.warn('Failed to remove output directory');
//       });
//     }
//   } 
// }


// type FilePost = { uri: string; fileName: string, type: string }
// export async function processSocial({ userId, images, videos, description, onProgress }: { userId: number, images: FilePost[], videos: FilePost[], description: string, onProgress: (progress: number, type: 'start' | 'progress' | 'complete' ) => void}): Promise<void>{
//   let videosPath = [];
//   const totalSteps = videos.length * 5;
//   let completedSteps = 0;

//   for (const video of videos) {
//     try {
//       const { s3FileDir } = await processVideo(video.uri, 'social', (videoProgress) => {
//         const progressFromCurrentVideo = (videoProgress / 100) * 5;
//         onProgress(((completedSteps + progressFromCurrentVideo) / totalSteps) * 100, 'progress');
//       });
//       completedSteps += 5;
//       videosPath.push(s3FileDir);
//     } catch (error) {
//       console.error(`Erro ao enviar o vídeo ${video}`, error);
//     }
//   }

//   await createNewSocialPost({ 
//     images: images,videos: 
//     videosPath, 
//     description: description
//   });

//   queryClient.invalidateQueries({ queryKey: ["profile", userId.toString()] });
//   queryClient.invalidateQueries({ queryKey: ["profile-posts", userId.toString()] });

//   setTimeout(() => onProgress(100, 'complete'), 500)
// }

// export async function processGrow({ userId, images, videos, description, day, strain_id, phase_id, onProgress }: { userId: number, images: FilePost[], videos: FilePost[], description: string, day: number, strain_id: number, phase_id: number, onProgress: (progress: number, type: 'start' | 'progress' | 'complete' ) => void}): Promise<void>{
//   let videosPath = [];
//   const totalSteps = videos.length * 5;
//   let completedSteps = 0;

//   for (const video of videos) {
//     try {
//       const { s3FileDir } = await processVideo(video.uri, 'grow', (videoProgress) => {
//         const progressFromCurrentVideo = (videoProgress / 100) * 5;
//         onProgress(((completedSteps + progressFromCurrentVideo) / totalSteps) * 100, 'progress');
//       });
//       completedSteps += 5;
//       videosPath.push(s3FileDir);
//     } catch (error) {
//       console.error(`Erro ao enviar o vídeo ${video}`, error);
//     }
//   }

//   await createNewGrowPost({ 
//     images: images,videos: 
//     videosPath, 
//     description: description,
//     day, 
//     strain_id, 
//     phase_id
//   });

//   queryClient.invalidateQueries({ queryKey: ["profile", userId.toString()] });
//   queryClient.invalidateQueries({ queryKey: ["profile-post-grow", userId.toString()] });

//   setTimeout(() => onProgress(100, 'complete'), 500)
// }

// export async function processReels({ userId, video, description, onProgress }: { userId: number, video: FilePost, description?: string, onProgress: (progress: number, type: 'start' | 'progress' | 'complete' ) => void}): Promise<void>{
//   try {
//     const { s3FileDir } = await processVideo(video.uri, 'grow', (videoProgress) => {
//       onProgress(videoProgress, 'progress');
//     });
  
//     await createNewReels({ video: s3FileDir, description: description });

//     queryClient.invalidateQueries({ queryKey: ["profile", userId.toString()] });
//     queryClient.invalidateQueries({ queryKey: ["profile-reels", userId.toString()] });

//     setTimeout(() => onProgress(100, 'complete'), 500)
//   } catch (error) {
//     console.error(`Erro ao enviar o vídeo ${video}`, error);
    
//   }
// }

// function getMimeType(fileName: string): string {
//   const extension = fileName.split('.').pop();
//   switch (extension) {
//     case 'm3u8':
//       return 'application/x-mpegURL';
//     case 'ts':
//       return 'video/MP2T';
//     case 'webp':
//       return 'image/webp';
//     default:
//       return 'application/octet-stream';
//   }
// }