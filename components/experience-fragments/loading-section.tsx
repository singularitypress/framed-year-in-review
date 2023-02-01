import React from "react";
import { LoadingSpinner } from "@components/global";

export const LoadingSection = () => (
  <div className="bg-framed-black text-white h-screen flex flex-col justify-center items-center">
    <LoadingSpinner />
  </div>
);
