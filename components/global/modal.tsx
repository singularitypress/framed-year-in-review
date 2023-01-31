import React from "react";

/**
 * @name Modal
 * @description Modal component with Tailwindcss
 * @param {React.ReactNode} children
 * @param {boolean} open
 * @param {() => void} onClose
 * @returns {React.ReactElement}
 * @example <Modal open={open} onClose={onClose}>{children}</Modal>
 */
export const Modal = ({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}): React.ReactElement => {
  return (
    <div
      className={`fixed transition-all duration-500 ${
        open
          ? "z-50 -translate-y-0 opacity-100"
          : "-z-10 -translate-y-10 opacity-0"
      }
      top-0 left-0 w-full h-full bg-gray-900/50 backdrop-blur-lg flex justify-center items-center p-20
      `}
    >
      <div
        onClick={onClose}
        className="absolute top-0 left-0 w-full h-full"
      ></div>
      <div className="max-h-full max-w-full overflow-y-auto bg-gray-900 rounded-lg shadow-2xl p-10">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 p-5 text-gray-100 hover:text-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
};
