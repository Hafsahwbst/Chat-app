// app/layout.js
"use client"
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import PrelineScript from "./prelineScript";
import { AppProvider } from '@/Context/AppProvider';
import IncomingCall from './chat/video/call-handler/page';
import { useState } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AppProvider>
          <IncomingCall 
            isOpen={isModalOpen} 
            closeModal={setIsModalOpen} 
          />
          
          <Toaster position="top-right" />
          {children}
          <PrelineScript />
        </AppProvider>
      </body>
    </html>
  );
}