import { ActivePostHomeContext } from "@/context/active-post-home-context";
import { useContext } from "react";

export const useActivePostHome = () => {
  const context = useContext(ActivePostHomeContext);
  if (!context) {
    throw new Error("useActivePost must be used within an ActivePostProvider");
  }
  return context;
};