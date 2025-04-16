import React, { createContext, useContext, useState } from "react";

interface CameraModalContextType {
  infoCamera?: any;
  isVisible: boolean;
  openCamera: (data: any) => void;
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
  const [infoCamera, setInfoCamera] = useState({});

  const openCamera = (data: any) => {
    setInfoCamera(data);
    setIsVisible(true);
  };

  const closeCamera = () => {
    setInfoCamera({});
    setIsVisible(false);
  };

  return (
    <CameraModalContext.Provider
      value={{ isVisible, infoCamera, openCamera, closeCamera }}
    >
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
