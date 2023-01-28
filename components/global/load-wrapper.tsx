import { sequentialFadeIn } from "@util";
import React, { ReactNode, useEffect } from "react";

export const LoadWrapper = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      sequentialFadeIn("load");
    }
  }, []);
  return <>{children}</>;
};
