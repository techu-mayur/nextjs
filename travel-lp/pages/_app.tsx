import { Fragment } from "react";
import Head from "next/head";
import type { AppProps } from "next/app";
import "bootstrap/dist/css/bootstrap.min.css";
import "swiper/css";
import "./global.css";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Head>
        <title>Landing Page UI Design in Figma (Community) - 2</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Component {...pageProps} />
    </Fragment>
  );
}
export default MyApp;
