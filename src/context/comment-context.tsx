import React, { createContext, useState, useContext, ReactNode } from 'react';

type CommentContextType = {
  postId: number | null;
  setPostId: (id: number | null) => void;
  isVisible: boolean;
  openBottomSheet: (id: number) => void;
  closeBottomSheet: () => void;
};

const CommentContext = createContext<CommentContextType | undefined>(undefined);

export const useCommentContext = () => {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error('useCommentContext deve ser usado dentro de um CommentProvider');
  }
  return context;
};

export const CommentProvider = ({ children }: { children: ReactNode }) => {
  const [postId, setPostId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const openBottomSheet = (id: number) => {
    setPostId(id);
    setIsVisible(true);
  };

  const closeBottomSheet = () => {
    setIsVisible(false);
    setPostId(null);
  };

  return (
    <CommentContext.Provider value={{ postId, setPostId, isVisible, openBottomSheet, closeBottomSheet }}>
      {children}
    </CommentContext.Provider>
  );
};
