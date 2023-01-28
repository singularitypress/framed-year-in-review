import React from "react";
import { LoadingSpinner } from "@components/global";

export const LoadingSection = () => (
  <div className="bg-gray-900 text-white h-screen flex flex-col justify-center items-center">
    <LoadingSpinner />
  </div>
);
