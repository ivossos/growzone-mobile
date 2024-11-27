import { createContext, useCallback, useState } from 'react';

export const ActivePostHomeContext = createContext<{
  activePostId: number | null;
  setActivePostId: React.Dispatch<React.SetStateAction<number | null>>;
  handlePostChange: (newPostId: number | null) => void;
} | null>(null);

export const ActivePostHomeProvider = ({ children }: { children: React.ReactNode }) => {
  const [activePostId, setActivePostId] = useState<number | null>(null);

  const handlePostChange = useCallback(
    (newPostId: number | null) => {
      setActivePostId(newPostId);
    },
    [setActivePostId]
  );
  return (
    <ActivePostHomeContext.Provider value={{ activePostId, setActivePostId, handlePostChange  }}>
      {children}
    </ActivePostHomeContext.Provider>
  );
};