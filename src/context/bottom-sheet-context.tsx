import React, { createContext, useState, useContext, ReactNode } from "react";

export type BottomSheetType =
  | "comment"
  | "report"
  | "search-genetic"
  | "rate-profile"
  | "reviews-profile"
  | "create-post"
  | "profile"
  | "report-user"
  | "block-user"
  | "unlock-user"
  | "report-comment"
  | "profile-cover"
  | "post-bottom-sheet"
  | "reel-post-bottom-sheet"
  | "grow-post-bottom-sheet"
  | "delete-post-bottom-sheet";

type BottomSheetContextType = {
  postId: number | null;
  userId: number | null;
  setPostId: (id: number | null) => void;
  isVisible: boolean;
  openBottomSheet: (data: {
    type: BottomSheetType;
    id?: number;
    userId?: number;
    data?: any | null;
    callbackFn?: ((prop?: any) => Promise<void>) | null;
  }) => void;
  closeBottomSheet: () => void;
  currentType: BottomSheetType | null;
  callback: ((prop?: any) => Promise<void>) | null;
  data: any | null;
};

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(
  undefined
);

export const useBottomSheetContext = () => {
  const context = useContext(BottomSheetContext);
  if (!context) {
    throw new Error(
      "useBottomSheetContext deve ser usado dentro de um BottomSheetProvider"
    );
  }
  return context;
};

export const BottomSheetProvider = ({ children }: { children: ReactNode }) => {
  const [postId, setPostId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [currentType, setCurrentType] = useState<BottomSheetType | null>(null);
  const [callback, setCallback] = useState<(() => Promise<void>) | null>(null);
  const [data, setData] = useState<any | null>(null);

  const openBottomSheet = ({
    type,
    id,
    userId,
    data: value,
    callbackFn,
  }: {
    type: BottomSheetType;
    id?: number;
    userId?: number;
    data?: any | null;
    callbackFn?: (() => Promise<void>) | null;
  }) => {
    if (id) setPostId(id);
    if (userId) setUserId(userId);
    if (value) setData(value)

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
    }, 0);
  };

  return (
    <BottomSheetContext.Provider
      value={{
        postId,
        userId,
        setPostId,
        isVisible,
        openBottomSheet,
        closeBottomSheet,
        currentType,
        callback,
        data
      }}
    >
      {children}
    </BottomSheetContext.Provider>
  );
};
