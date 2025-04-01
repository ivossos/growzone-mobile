import React, { createContext, useContext, useState } from "react";

interface CameraModalContextType {
  isVisible: boolean;
  openCamera: () => void;
  closeCamera: () => void;
}

const CameraModalContext = createContext<CameraModalContextType | undefined>(
  undefined
);

export const CameraModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const openCamera = () => setIsVisible(true);
  const closeCamera = () => setIsVisible(false);

  return (
    <CameraModalContext.Provider value={{ isVisible, openCamera, closeCamera }}>
      {children}
    </CameraModalContext.Provider>
  );
};

export const useCameraModal = () => {
  const context = useContext(CameraModalContext);
  if (!context) {
    throw new Error(
      "useCameraModal deve ser usado dentro de um CameraModalProvider"
    );
  }
  return context;
};
