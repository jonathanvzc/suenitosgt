/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // =========================
  // 🖼️ IMÁGENES (SUPABASE + OPTIMIZACIÓN)
  // =========================
  images: {
    domains: [
      "img.kwcdn.com",
      "images.unsplash.com",
      "yxsestcuyqdsvicvhgzh.supabase.co", // 👈 TU SUPABASE
    ],
    formats: ["image/avif", "image/webp"],
  },

  // =========================
  // 🔐 HEADERS DE SEGURIDAD
  // =========================
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;