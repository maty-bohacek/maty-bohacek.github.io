'use client';

import Image from 'next/image';
import { useState } from 'react';

interface HeadshotImageProps {
  src: string;
  hoverSrc: string;
  alt: string;
}

export default function HeadshotImage({ src, hoverSrc, alt }: HeadshotImageProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-64 h-64 lg:w-80 lg:h-80 overflow-hidden bg-neutral-200 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Default image */}
      <Image
        src={src}
        alt={alt}
        width={320}
        height={320}
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-0' : 'opacity-100'
        }`}
        priority
      />
      {/* Hover image */}
      <Image
        src={hoverSrc}
        alt={`${alt} - alternate`}
        width={320}
        height={320}
        className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
        priority
      />
    </div>
  );
}
