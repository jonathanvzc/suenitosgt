import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";
import CartBottomBar from "@/components/CartBottomBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sueñitos GT2",
  description: "Tienda online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-white text-black">

        {/* 🔥 NAVBAR GLOBAL */}
        <Navbar />

        {/* 🛒 MINI CARRITO GLOBAL */}
        <CartDrawer />

        {/* 📱 BOTTOM BAR MOBILE */}
        <CartBottomBar />

        {/* 📦 CONTENIDO */}
        {children}

        {/* 🔔 TOASTS */}
        <Toaster
          position="top-center"
          containerStyle={{
            top: "50%",
            transform: "translateY(-50%)",
          }}
          toastOptions={{
            style: {
              background: "#333",
              color: "#fff",
              borderRadius: "10px",
              padding: "12px 16px",
            },
          }}
        />

      </body>
    </html>
  );
}