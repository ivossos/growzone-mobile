import { ProgressContext } from "@/context/progress-context";
import { useContext } from "react";

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};