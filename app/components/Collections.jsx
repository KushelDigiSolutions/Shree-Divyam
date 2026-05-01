"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCurrency } from '../context/CurrencyContext';
import DirectAddToCart from './DirectAddToCart';

const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

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
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/proxy/premium/products", { cache: 'no-store' });

        if (!response.ok) throw new Error("API response not ok");
        
        const text = await response.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error("Primary API returned non-JSON");
        }

        if (isMounted) {
          const data = json.data || json;
          if (Array.isArray(data)) {
            setProducts(data);
          }
        }
      } catch (error) {
        // Primary API failed - try fallback
        if (isMounted) {
          try {
            const fallbackResponse = await fetch("/api/proxy/categories", { cache: 'no-store' });
            
            if (fallbackResponse.ok) {
              const text = await fallbackResponse.text();
              try {
                const fallbackJson = JSON.parse(text);
                const data = Array.isArray(fallbackJson) ? fallbackJson : (fallbackJson.value || []);
                if (data.length > 0) {
                  setProducts(data);
                  return;
                }
              } catch (e) { /* non-JSON fallback, use hardcoded */ }
            }
          } catch (e) { /* fallback fetch failed */ }
          
          // Both APIs failed - use hardcoded category data so the section still renders
          setProducts([
            { id: 1, name: "Laddu Gopal Dresses", slug: "laddu-gopal", image_path: null },
            { id: 2, name: "Radhe Rani Dresses", slug: "radhe-rani", image_path: null },
            { id: 3, name: "Mata Rani Dresses", slug: "mata-rani", image_path: null }
          ]);
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
    <section id="premium-collections" className="mx-auto max-w-[1720px] py-10 sm:py-16 md:py-20 bg-[#FFF6E8] w-full h-auto overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24">

        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-[24px] sm:text-[32px] md:text-[40px] font-playfair text-[#7A1F3D] font-bold">
            Premium Collections
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-row lg:justify-center gap-6 sm:gap-8">
          {loading ? (
            <p className="text-center col-span-full py-10 text-gray-500">Loading collections... (Premium)</p>
          ) : (
            products.map((item, index) => {
              // Determine if it's a product (from the new API) or a category (fallback)
              const isProduct = !!item.image_path;

              // Resolve the image
              const imageUrl = isProduct
                ? (item.image_path?.startsWith('http') ? item.image_path : `${IMAGE_BASE_URL}${item.image_path}`)
                : (categoryImages[item.slug] || defaultImages[index % defaultImages.length]);

              // Resolve the link
              const href = isProduct
                ? `/product-details/${item.slug}`
                : `/category/${item.slug}`;

              return (
                <div
                  key={item.id || index}
                  className="w-full sm:w-auto lg:w-[380px] h-auto overflow-hidden shrink-0 group relative flex flex-col bg-white/40 hover:bg-white/60 transition-colors duration-300 rounded-sm shadow-sm mx-auto"
                >
                  <div className="aspect-[4/5] sm:aspect-[3/4] md:aspect-[4/5] lg:h-[480px] w-full overflow-hidden bg-white/20 relative">
                    <img src={imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {/* Full-coverage hover overlay */}
                    <div className="absolute inset-0 bg-[#7A1F3D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />
                  </div>
                  <div className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="text-[16px] sm:text-[18px] md:text-[21px] font-medium text-[#303030] font-gt-walsheim mb-2 sm:mb-3 line-clamp-1 group-hover:text-[#7A1F3D] transition-colors">
                      {item.name}
                    </h3>

                    <p className="text-[14px] text-gray-600 mb-4 line-clamp-2 font-gt-walsheim">
                      {item.short_description || (isProduct ? "Premium exclusive collection piece." : `Explore our exquisite ${item.name} collection.`)}
                    </p>

                    <div className="mt-auto">
                      {(item.price || item.usd_price) && (
                        <p className="text-[#7A1F3D] font-bold text-[18px] sm:text-[20px] md:text-[24px] mb-2 sm:mb-3 font-gt-walsheim">
                          {formatPrice(item.price, item.usd_price)}
                        </p>
                      )}

                      {/* BUTTONS */}
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link href={href} className="w-full">
                          <button className="w-full h-[42px] flex items-center justify-center bg-[#7A1F3D] border border-[#7A1F3D] text-white text-[14px] font-medium font-gt-walsheim hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 cursor-pointer">
                            Shop Now
                          </button>
                        </Link>
                        {isProduct && (
                          <div className="w-full">
                            <DirectAddToCart product={item} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>


      </div>
    </section>
  );
}


