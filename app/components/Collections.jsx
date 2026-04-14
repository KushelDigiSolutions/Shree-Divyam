"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCurrency } from '../context/CurrencyContext';

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://shreedivyam.kdscrm.com/api/premium/products", { cache: 'no-store' });
        
        if (!response.ok) throw new Error("API response not ok");
        const json = await response.json();
        
        if (isMounted) {
          const data = json.data || json;
          if (Array.isArray(data)) {
            setProducts(data);
          }
        }
      } catch (error) {
        console.error("Fetch error:", error);
        if (isMounted) {
          try {
            const fallbackResponse = await fetch("https://shreedivyam.kdscrm.com/api/categories", { cache: 'no-store' });
            const fallbackJson = await fallbackResponse.json();
            const data = Array.isArray(fallbackJson) ? fallbackJson : (fallbackJson.value || []);
            setProducts(data);
          } catch (e) {
            console.error("Fallback failed:", e);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <section className="mx-auto max-w-[1720px] py-20 bg-[#FFF6E8] w-full h-auto overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-8 md:px-16 lg:px-24">

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-[40px] font-playfair text-[#7A1F3D] font-bold">
            Premium Collections
          </h2>
        </div>

        <div className="flex flex-col gap-8 md:flex-row md:justify-center">
          {loading ? (
            <p className="text-center w-full text-gray-500">Loading collections... (Premium)</p>
          ) : (
            products.map((item, index) => {
              // Determine if it's a product (from the new API) or a category (fallback)
              const isProduct = !!item.image_path;
              
              // Resolve the image
              const imageUrl = isProduct 
                ? item.image_path 
                : (categoryImages[item.slug] || defaultImages[index % defaultImages.length]);

              // Resolve the link
              const href = isProduct 
                ? `/product-details/${item.slug}` 
                : `/category/${item.slug}`;

              return (
                <Link
                  key={item.id || index}
                  href={href}
                  className="w-full md:w-[380px] h-auto overflow-hidden cursor-pointer shrink-0 group relative block bg-white/40 hover:bg-white/60 transition-colors duration-300"
                >
                  <div className="h-[480px] w-full overflow-hidden">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="text-lg md:text-xl font-medium text-[#303030] font-playfair truncate">
                      {item.name}
                    </h3>
                    {(item.price || item.usd_price) && (
                      <p className="text-[#7A1F3D] font-bold mt-2 text-xl">
                        {formatPrice(item.price, item.usd_price)}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </section>
  );
}
