// Renderizador tolerante a fallos para imagenes de producto con fallback visual por URL invalida.
"use client";

import { useState } from "react";

type Props = {
  src: string | null;
  alt: string;
  priority?: boolean;
};

export default function ProductImage({
  src,
  alt = "producto",
  priority = false,
}: Props) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasFailed = Boolean(src && failedSrc === src);

  if (!src || hasFailed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm font-medium text-gray-400">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        loading={priority ? "eager" : "lazy"}
        onError={() => setFailedSrc(src)}
      />
    </div>
  );
}
