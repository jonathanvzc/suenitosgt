import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
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
  title: "Sueñitos GT",
  description: "Tienda online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-white text-black">

        {/* 🔥 NAVBAR GLOBAL */}
        <Navbar />

        {/* 🛒 MINI CARRITO */}
        <CartDrawer />

        {/* 📱 MOBILE BAR */}
        <CartBottomBar />

        {/* 📦 CONTENIDO */}
        {children}

        {/* 🔔 TOAST */}
        <Toaster
          position="top-center"
          containerStyle={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: "#1f2937",
              color: "#fff",
              borderRadius: "12px",
              padding: "14px 18px",
              fontSize: "14px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            },
          }}
        />

      </body>
    </html>
  );
}