import type { AppProps } from "next/app";
import { Inter, Poppins } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${inter.className} ${poppins.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
