import type { AppProps } from "next/app";
import { Cormorant_Garamond, Outfit, Poppins } from "next/font/google";
import "@/app/globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const outfit = Outfit({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const poppins = Poppins({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${cormorant.variable} ${outfit.variable} ${poppins.variable} font-outfit`}>
      <Component {...pageProps} />
    </div>
  );
}
