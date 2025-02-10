import { CreatePostContext } from "@/context/create-post-context";
import { useContext } from "react";

export const useCreatePostProgress = () => {
  const context = useContext(CreatePostContext);
  if (!context) {
    throw new Error('useCreatePostProgress must be used within a CreatePostContext');
  }
  return context;
};