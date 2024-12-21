import { createContext, useState, ReactNode } from 'react';

interface ProgressContextProps {
  progress: number;
  message: string;
  isProcessing: boolean;
  shouldVibrate: boolean;
  updateProgress: (value: number, message?: string) => void;
  startProcessing: () => void;
  completeProcessing: () => void;
  resetProgress: () => void;
  toggleVibration: () => void;
}

export const ProgressContext = createContext<ProgressContextProps | undefined>(undefined);

export const ProgressProvider = ({ children }: { children: ReactNode }) => {
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

  return (
    <ProgressContext.Provider
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
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
};
