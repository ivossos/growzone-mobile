import React, { createContext, useContext, useState } from "react";

interface CameraModalContextType {
  infoCamera?: any;
  isVisible: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
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
  const [loading, setLoading] = useState(false);

  const openCamera = (data: any) => {
    setInfoCamera(data);
    setIsVisible(true);
    setTimeout(() => {
      setLoading(true);
    }, 300);
  };

  const closeCamera = () => {
    setInfoCamera({});
    setIsVisible(false);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <CameraModalContext.Provider
      value={{
        isVisible,
        infoCamera,
        openCamera,
        closeCamera,
        loading,
        setLoading,
      }}
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
