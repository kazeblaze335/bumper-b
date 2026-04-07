"use client";

import Image from "next/image";

interface GlitchImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function GlitchImage({
  src,
  alt,
  className = "",
}: GlitchImageProps) {
  // We generate a unique ID for the SVG filter based on the image src
  // so multiple images on the same page don't conflict.
  const filterId = `glitch-${src.replace(/\W/g, "")}`;

  return (
    <div
      className={`relative w-full h-full overflow-hidden group cursor-none bg-zinc-900 ${className}`}
    >
      {/* 1. THE SVG TV GLITCH FILTER */}
      <svg className="hidden">
        <filter id={filterId}>
          {/* baseFrequency="0.01 0.5" creates horizontal static/tearing bands */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.01 0.5"
            numOctaves="2"
            result="noise"
          />
          {/* We push the noise map into a displacement map to physically tear the pixels */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="15"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </svg>

      {/* 2. THE BASE IMAGE (Clean, normal state) */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:scale-105"
      />

      {/* 3. THE GLITCHED LAYER (Revealed on hover) */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        // This layer sits perfectly on top, but is filtered through our SVG displacement map!
        className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ filter: `url(#${filterId})` }}
      />

      {/* 4. THE CRT SCANLINES & VIGNETTE (Adds that Haute Hardware feel) */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-40 transition-opacity duration-500 z-10 mix-blend-overlay"
        style={{
          backgroundImage: `repeating-linear-gradient(
            to bottom,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.8) 2px,
            rgba(0, 0, 0, 0.8) 4px
          )`,
        }}
      />

      {/* Edge darkening for cinematic focus */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)] z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
}
