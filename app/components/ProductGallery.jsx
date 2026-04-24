"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Image */}
      <div className="overflow-hidden border border-[#ddd2c4] bg-[#FDFBF9] shadow-sm rounded-sm">
        <div className="relative aspect-[4/5] w-full group overflow-hidden">
          <Image
            src={activeImage}
            alt="Product Image"
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            priority
          />
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 sm:gap-4 transition-all pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(img)}
              className={`relative overflow-hidden border-2 transition-all p-0.5 rounded-sm cursor-pointer hover:border-[#7A1F3D] ${
                activeImage === img ? 'border-[#7A1F3D] shadow-sm' : 'border-transparent bg-white'
              }`}
            >
              <div className="relative aspect-square w-full">
                <Image
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className={`object-cover transition-opacity duration-300 ${
                    activeImage === img ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}