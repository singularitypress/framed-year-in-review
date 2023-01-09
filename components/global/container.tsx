import React, { ReactNode } from "react";

export const Container = ({ children = <></>, className = "" }: { children?: ReactNode, className?: string }) => {
  return <div className={`container px-4 mx-auto ${className}`}>{children}</div>;
};