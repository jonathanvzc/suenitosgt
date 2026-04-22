// Componente de imagen reutilizable para resolver fuentes publicas con fallback visual consistente.
"use client";

import { useState } from "react";

type Props = {
  src?: string | null;
  alt: string;
  width: number;
  height: number;
  className?: string;
};

export default function SmartImage({
  src,
  alt,
  width,
  height,
  className,
}: Props) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 text-sm font-medium text-gray-400 ${className || ""}`}>
        Sin imagen
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
