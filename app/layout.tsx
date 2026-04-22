// Layout raiz de la tienda con fuentes globales, navbar, drawer del carrito y sistema de toasts.
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import CartBottomBar from "@/components/CartBottomBar";
import "./globals.css";

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
  description: "Tienda online para pedidos por WhatsApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        <CartDrawer />
        <CartBottomBar />
        <main>{children}</main>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3500,
            style: {
              background: "#065f46",
              color: "#fff",
              borderRadius: "18px",
              padding: "14px 18px",
              fontSize: "14px",
              boxShadow: "0 18px 32px rgba(6,95,70,0.24)",
            },
          }}
        />
      </body>
    </html>
  );
}
