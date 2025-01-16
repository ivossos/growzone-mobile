import { FlashList } from '@shopify/flash-list';
import React, { createContext, useContext, useRef } from 'react';

type ScrollToTopContextProps<T> = {
  scrollToTop: () => void;
  setFlatListRef: (ref: FlashList<T> | null) => void;
};

const ScrollToTopContext = createContext<ScrollToTopContextProps<any> | null>(null);

export const ScrollToTopProvider = <T,>({ children }: { children: React.ReactNode }) => {
  const flatListRef = useRef<FlashList<T>  | null>(null);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const setFlatListRef = (ref: FlashList<T>  | null) => {
    flatListRef.current = ref;
  };

  return (
    <ScrollToTopContext.Provider value={{ scrollToTop, setFlatListRef }}>
      {children}
    </ScrollToTopContext.Provider>
  );
};

export const useScrollToTop = () => {
  const context = useContext(ScrollToTopContext);
  if (!context) {
    throw new Error('useScrollToTop must be used within a ScrollToTopProvider');
  }
  return context;
};
