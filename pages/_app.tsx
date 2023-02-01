import "../styles/globals.scss";
import type { AppProps } from "next/app";
import { Footer, Navigation } from "@components/global";
import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Navigation />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}
