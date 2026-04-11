import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/CartDrawer";

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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-white text-black">

        {/* 🔥 NAVBAR GLOBAL */}
        <Navbar />

        {/* 🛒 MINI CARRITO GLOBAL */}
        <CartDrawer />

        {/* 📦 CONTENIDO */}
        {children}

        {/* 🔔 TOASTS */}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}