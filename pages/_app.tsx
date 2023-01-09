import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { Navigation } from "@components/global";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navigation />
      <Component {...pageProps} />
    </>
  );
}
