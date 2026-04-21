"use client";

import Image from "next/image";

type Props = {
  src: string | null;
  alt?: string;
};

export default function ProductImage({ src, alt = "producto" }: Props) {
  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        priority
      />
    </div>
  );
}