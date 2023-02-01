import Link from "next/link";
import React from "react";

/**
 * Footer component
 * @description Footer component using tailwindcss
 * @returns {JSX.Element}
 */

export const Footer = () => {
  return (
    <footer className="bg-framed-black text-white text-center text-xs py-10 w-full z-40">
      <Link
        href="https://github.com/singularitypress"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white border-b border-b-white border-dotted hover:border-b-transparent"
      >
        Jay Pandya
      </Link>{" "}
      © {new Date().getFullYear()} All rights reserved.
    </footer>
  );
};
