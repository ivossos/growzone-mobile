import React, { createContext, useState, useContext, ReactNode, useRef } from 'react';
import BottomSheet from '@gorhom/bottom-sheet';

type BottomSheetType = 'comment' | 'report'; 

type BottomSheetContextType = {
  postId: number | null;
  setPostId: (id: number | null) => void;
  isVisible: boolean;
  openBottomSheet: (type: BottomSheetType, id: number) => void;
  closeBottomSheet: () => void;
  currentType: BottomSheetType | null;
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
  const [isVisible, setIsVisible] = useState(false);
  const [currentType, setCurrentType] = useState<BottomSheetType | null>(null);

  const openBottomSheet = (type: BottomSheetType, id: number) => {
    setPostId(id);
    setCurrentType(type);
    setIsVisible(true);
  };

  const closeBottomSheet = () => {
    setTimeout(() => {
      setIsVisible(false);
      setPostId(null);
      setCurrentType(null);
    }, 300);
  };

  return (
    <BottomSheetContext.Provider value={{ postId, setPostId, isVisible, openBottomSheet, closeBottomSheet, currentType }}>
      {children}
    </BottomSheetContext.Provider>
  );
};
