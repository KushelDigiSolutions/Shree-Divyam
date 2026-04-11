"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Map slugs to their respective images
const categoryImages = {
  "laddu-gopal": "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867814/laddu-Gopal.png",
  "radhe-rani": "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867815/radha-krishna.png",
  "mata-rani": "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867815/mata-rani.png"
};

const defaultImages = [
  "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867814/laddu-Gopal.png",
  "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867815/radha-krishna.png",
  "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774867815/mata-rani.png"
];

export default function Collections() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://shreedivyam.kdscrm.com/api/categories");
        const data = await response.json();
        if (data && Array.isArray(data)) {
          setCategories(data);
        } else if (data && data.value) {
          setCategories(data.value);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="mx-auto max-w-[1720px] py-20 bg-[#FFF6E8] w-full md:h-[716px] h-auto overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-8 md:px-16 lg:px-24">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-[40px] font-playfair text-[#7A1F3D] font-bold">
            Premium Collections
          </h2>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:justify-center">
          {loading ? (
            // Skeleton or loading state could go here, for now will use empty div or fallbacks
            <p className="text-center w-full text-gray-500">Loading collections...</p>
          ) : (
            categories.map((item, index) => {
              // Resolve the image for this category using the dictionary mapping
              const imageUrl = categoryImages[item.slug] || defaultImages[index % defaultImages.length];

              return (
                <Link
                  key={item.id || index}
                  href={`/category/${item.slug}`}
                  className="w-full md:w-[380px] h-[500px] overflow-hidden cursor-pointer shrink-0 group relative block"
                >
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </Link>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
