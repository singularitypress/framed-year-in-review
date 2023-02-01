import React from "react";

export const ErrorSection = ({ message = "" }: { message?: string }) => (
  <div className="bg-framed-black text-white h-screen flex flex-col justify-center items-center">
    <h1 className="text-4xl font-bold text-center my-auto">Error: {message}</h1>
  </div>
);

export const ErrorNoData = () => (
  <div className="bg-framed-black text-white h-screen flex flex-col justify-center items-center">
    Error: No data
  </div>
);
