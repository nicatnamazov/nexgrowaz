import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { LangProvider } from "@/utils/LangContext";

const inter = Inter({ subsets: ["latin", "latin-ext"] });

export const metadata: Metadata = {
  title: "NexGrow",
  description: "Dil Bilməyən Qalmasın. Xaricdə Təhsil, General English, IELTS, Rus Dili, Alman Dili.",
  icons: {
    icon: [
      { url: "/Logo.jpeg", type: "image/jpeg" },
    ],
    apple: "/Logo.jpeg",
    shortcut: "/Logo.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="az" className="scroll-smooth">
      <head>
        <link rel="icon" href="/Logo.jpeg" type="image/jpeg" />
      </head>
      <body
        className={`${inter.className} antialiased bg-[#F6F9EA] text-[#0A0A0A] font-sans selection:bg-[#D4F754] selection:text-black min-h-screen flex flex-col`}
      >
        <LangProvider>
          <SmoothScroll>
            <Navbar />
            <div className="flex-grow">
              {children}
            </div>
            <Footer />
          </SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
