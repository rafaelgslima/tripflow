import type { AppProps } from "next/app";
import { Cormorant_Garamond, Outfit, Poppins, Merriweather, Lora } from "next/font/google";
import "@/app/globals.css";
import "klaro/dist/klaro.css";
import { useKlaroConsent } from "@/hooks/useKlaroConsent";

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

const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-merriweather",
  display: "swap",
});

const lora = Lora({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export default function App({ Component, pageProps }: AppProps) {
  useKlaroConsent();

  return (
    <div className={`${cormorant.variable} ${outfit.variable} ${poppins.variable} ${merriweather.variable} ${lora.variable} font-outfit`}>
      <Component {...pageProps} />
    </div>
  );
}
