import { CertificateProvider } from "@/components/CertificateContext";
import { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CertificateProvider>
      <Component {...pageProps} />
    </CertificateProvider>
  );
}