import React from "react";

/**
 * React Component that renders a segmented control using tailwindcss
 */
export const SegmentedControl = ({
  data,
  selected,
  onChange,
}: {
  data: string[];
  selected: string;
  onChange: (data: string) => void;
}) => {
  return (
    <div className="flex flex-row items-center justify-center w-fit border border-white/10 rounded-md p-2 bg-framed-black">
      {data.map((item, index) => (
        <div
          key={index}
          onClick={() => onChange(item)}
          className={`${selected === item ? "bg-white/20" : ""}
          ${index === 0 ? "rounded-l-md" : ""}
          ${index === data.length - 1 ? "rounded-r-md" : ""}
          cursor-pointer
          transition-all
          duration-300
          ease-in-out
          px-4 py-2 hover:bg-opacity-10 hover:bg-white`}
        >
          {item}
        </div>
      ))}
    </div>
  );
};
