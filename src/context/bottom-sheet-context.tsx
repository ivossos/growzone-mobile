import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

type BottomSheetType = 'comment' | 'report' | 'search' | 'rate-profile' | 'reviews-profile' | 'create-post';

type BottomSheetContextType = {
  postId: number | null;
  userId: number | null;
  setPostId: (id: number | null) => void;
  isVisible: boolean;
  openBottomSheet: (data: { type: BottomSheetType; id?: number; userId?: number, callbackFn?: (() => Promise<void>) | null}) => void;
  closeBottomSheet: () => void;
  currentType: BottomSheetType | null;
  callback: (() => Promise<void>) | null;
};

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

export const useBottomSheetContext = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error('useBottomSheetContext deve ser usado dentro de um BottomSheetProvider');
  }
  return context;
};

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  const [postId, setPostId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentType, setCurrentType] = useState<BottomSheetType | null>(null);
  const [callback, setCallback] = useState<(() => Promise<void>) | null>(null); 

  const openBottomSheet = (
    { type, id, userId, callbackFn }: { type: BottomSheetType; id?: number; userId?: number, callbackFn?: (() => Promise<void>) | null}) => {
    if (id) setPostId(id);
    if (userId) setUserId(userId);
    setCurrentType(type);
    setIsVisible(true);
    if (callbackFn) {
      setCallback(() => callbackFn); 
    }
  };

  const closeBottomSheet = () => {
    setTimeout(() => {
      setIsVisible(false);
      setPostId(null);
      setUserId(null);
      setCurrentType(null);
      if (callback) {
        setCallback(null);
      }
    }, 200);
  };

  return (
    <BottomSheetContext.Provider
      value={{ postId, userId, setPostId, isVisible, openBottomSheet, closeBottomSheet, currentType, callback }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};
