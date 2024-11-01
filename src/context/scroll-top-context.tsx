import React, { createContext, useContext, useRef } from 'react';
import { FlatList } from 'react-native';

type ScrollToTopContextProps = {
  scrollToTop: () => void;
  setFlatListRef: (ref: FlatList | null) => void;
};

const ScrollToTopContext = createContext<ScrollToTopContextProps | null>(null);

export const ScrollToTopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const flatListRef = useRef<FlatList | null>(null);

  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const setFlatListRef = (ref: FlatList | null) => {
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
