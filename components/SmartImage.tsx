"use client";

import Image from "next/image";
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

  const finalSrc =
    !src || error ? "/placeholder.png" : src;

  return (
    <Image
      src={finalSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQH+5Y0b9wAAAABJRU5ErkJggg=="
      onError={() => setError(true)}
    />
  );
}