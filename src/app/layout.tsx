import type { Metadata } from "next";
import { Hind_Siliguri, Orbitron } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], variable: "--font-hind", display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["600", "800"], variable: "--font-orbitron", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Brothers Crockeries | Quality Home, Happy Family", template: "%s | Brothers Crockeries" },
  description: "Crockeries, cookware, kitchen appliances and home essentials from New Brothers Crockeries, Chattogram.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="brothers" className={`${hind.variable} ${orbitron.variable}`}>
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
