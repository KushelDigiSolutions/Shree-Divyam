"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images }) {
  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="w-full">
      <div className="overflow-hidden border border-[#ddd2c4] bg-white">
        <div className="relative aspect-[4/5] w-full">
          <Image
            src={activeImage}
            alt="Product Image"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {images.slice(1).map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(img)}
            className={`overflow-hidden border transition ${activeImage === img ? 'border-[#8a1d45]' : 'border-[#ddd2c4]'} bg-white`}
          >
            <div className="relative aspect-[395/338] w-full">
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}