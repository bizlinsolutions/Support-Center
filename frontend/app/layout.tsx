import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import LayoutWrapper from "./components/LayoutWrapper";
import { ToastProvider } from "./components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeskFlow Helpdesk",
  description: "Support ticket management system by DeskFlow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200">
        <ToastProvider>
          <Navbar />
          <div className="flex flex-1 w-full min-h-screen">
            <Sidebar />
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
