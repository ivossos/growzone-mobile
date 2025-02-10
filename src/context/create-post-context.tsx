import { FilePost, processGrow, processReels, processSocial } from '@/api/mux/upload';
import { createContext, useState, ReactNode } from 'react';

type CreateSocialPostProps = { 
  userId: number, 
  images: FilePost[], 
  videos: FilePost[], 
  description: string 
}

type CreateGrowPostProps = { 
  userId: number;
  images: FilePost[]; 
  videos: FilePost[];
  description: string;
  day: number;
  strain_id: number;
  phase_id: number;
}

type CreateReelsProps = { 
  userId: number, 
  video: FilePost, 
  description: string 
}

interface CreatePostContextProps {
  progress: number;
  message: string;
  isProcessing: boolean;
  shouldVibrate: boolean;
  updateProgress: (value: number, message?: string) => void;
  startProcessing: () => void;
  completeProcessing: () => void;
  resetProgress: () => void;
  toggleVibration: () => void;
  createSocialPost: (data: CreateSocialPostProps) => Promise<void>;
  createReelsPost: (data: CreateReelsProps) => Promise<void>;
  createGrowPost: (data: CreateGrowPostProps) => Promise<void>;
}

export const CreatePostContext = createContext<CreatePostContextProps | undefined>(undefined);

export const CreatePostProvider = ({ children }: { children: ReactNode }) => {
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [shouldVibrate, setShouldVibrate] = useState(false);

  const updateProgress = (value: number, message: string = '') => {
    setProgress(value);
    setMessage(message);
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setProgress(0);
    setMessage('');
  };

  const completeProcessing = () => {
    setIsProcessing(false);
    setProgress(100);
    setMessage('Processamento concluído');
  };

  const resetProgress = () => {
    setProgress(0);
    setMessage('');
    setIsProcessing(false);
  };

  const toggleVibration = () => {
    setShouldVibrate(true);

    setTimeout(() => {
      setShouldVibrate(false);
    }, 500);
  };

  const createSocialPost = async (data: CreateSocialPostProps) => {
    try {
      startProcessing();

      await processSocial({ 
        ...data,
        onProgress: updateProgress
      })

      completeProcessing();
    } catch (error) {
      updateProgress(100, 'Erro ao criar o post');
      setIsProcessing(false);
    }
  };

  const createGrowPost = async (data: CreateGrowPostProps) => {
    try {
      startProcessing();

      await processGrow({
        ...data,
        onProgress: updateProgress
      })

      completeProcessing();
    } catch (error) {
      updateProgress(100, 'Erro ao criar o post');
      setIsProcessing(false);
    }
  };

  const createReelsPost = async (data: CreateReelsProps) => {
    try {
      startProcessing();

      await processReels({ 
        ...data,
        onProgress: updateProgress
      })

      completeProcessing();
    } catch (error) {
      updateProgress(100, 'Erro ao criar o post');
      setIsProcessing(false);
    }
  };

  return (
    <CreatePostContext.Provider
      value={{
        progress,
        message,
        isProcessing,
        shouldVibrate,
        updateProgress,
        startProcessing,
        completeProcessing,
        resetProgress,
        toggleVibration,
        createSocialPost,
        createGrowPost,
        createReelsPost
      }}
    >
      {children}
    </CreatePostContext.Provider>
  );
};
