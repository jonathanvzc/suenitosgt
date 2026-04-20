// components/ProductImage.tsx

"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductImage({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 text-sm">
        Sin imagen
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      onError={() => setError(true)}
    />
  );
}