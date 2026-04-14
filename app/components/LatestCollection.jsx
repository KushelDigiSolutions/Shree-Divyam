"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";

import Link from "next/link";
import { products as staticProducts } from "../data/products";
import { useCurrency } from "../context/CurrencyContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function LatestCollection() {
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch("https://shreedivyam.kdscrm.com/api/products");
        const json = await response.json();
        if (json && json.success && Array.isArray(json.data)) {
          // We can just use the latest fetched products (maybe slice or filter if needed, 
          // here we just use the first 8 or all as the "Latest")
          setLatestProducts(json.data.slice(0, 10)); // Adjust slice size as needed
        }
      } catch (error) {
        console.error("Error fetching latest products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  return (
    <section className="mx-auto max-w-[1720px] bg-[#F5F5F7] py-20">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* LEFT BANNER */}
          <div className="relative w-full lg:w-[584px] h-[400px] lg:h-[600px] overflow-hidden group bg-gray-200">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png"
              alt="Banner"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Text */}
            <div className="absolute inset-0 flex flex-col justify-center px-12">
              <h3 className="text-[28px] sm:text-[34px] lg:text-[40px] leading-tight font-serif text-white mb-8">
                Let Your Love <br className="hidden sm:block" /> Tick Forever
              </h3>

              <button className="flex items-center gap-2 bg-white text-black px-6 py-3 w-fit text-[15px] font-medium hover:bg-gray-100 transition">
                Shop Now <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:flex-1 min-w-0 flex flex-col">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-[24px] sm:text-[28px] lg:text-[32px] font-playfair font-semibold text-[#303030]">
                Latest Collection
              </h2>

              <div className="flex gap-3">
                <button className="swiper-button-prev-custom w-10 h-10 flex items-center justify-center border border-gray-300 rounded-full hover:bg-[#7A1F3D] hover:text-white transition cursor-pointer">
                  <ChevronLeft size={18} />
                </button>

                <button className="swiper-button-next-custom w-10 h-10 flex items-center justify-center rounded-full bg-[#7A1F3D] text-white hover:bg-[#5E182F] transition cursor-pointer">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="relative flex-1 min-h-[500px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#7A1F3D]" size={40} />
                </div>
              ) : (
                <Swiper
                  modules={[Navigation, Autoplay]}
                  navigation={{
                    prevEl: ".swiper-button-prev-custom",
                    nextEl: ".swiper-button-next-custom",
                  }}
                  spaceBetween={55}
                  slidesPerView={1}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 2 },
                    1280: { slidesPerView: 2.1 },
                  }}
                  className="w-full h-full pb-10"
                >
                  {latestProducts.map((product) => (
                    <SwiperSlide key={product.id}>
                      <div className="bg-white p-1.5 w-full max-w-[330px] h-auto min-h-[500px] shadow-sm hover:shadow-lg transition-all duration-300 mx-auto flex flex-col">
                        {/* IMAGE */}
                        <div className="w-full h-[280px] bg-gray-50 overflow-hidden mb-6">
                          <img
                            src={`${IMAGE_BASE_URL}${product.image_path}`}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              // Fallback image logic matching ProductGrid
                              const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === product.name.toLowerCase() || p.slug === product.slug);
                              e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[product.id % staticProducts.length].image;
                            }}
                          />
                        </div>

                        {/* CONTENT */}
                        <div className="px-2 flex flex-col flex-1">
                          <h4 className="text-[21px] font-gt-walsheim font-medium text-[#303030] mb-2 leading-tight line-clamp-1">
                            {product.name}
                          </h4>

                          <p className="text-[14px] font-right font-gt-walsheim text-[#303030] mb-2 line-clamp-2">
                            {product.short_description || "Premium exclusive collection piece."}
                          </p>

                          <p className="text-[24px] font-bold text-[#7A1F3D] mb-6">
                            {formatPrice(product.price, product.usd_price)}
                          </p>

                          {/* BUTTONS */}
                          <div className="flex gap-3 mt-auto">
                            <Link href={`/product-details/${product.slug}`} className="flex-1">
                              <button className="w-full bg-[#7A1F3D] text-white py-2.5 text-[14px] font-semibold hover:bg-[#5E182F] transition">
                                Shop Now
                              </button>
                            </Link>

                            <button className="flex-1 border border-[#7A1F3D] text-[#7A1F3D] py-2.5 text-[14px] font-semibold hover:bg-[#7A1F3D] hover:text-white transition">
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                  
                  {latestProducts.length === 0 && !loading && (
                    <div className="text-center py-10 text-gray-500 w-full flex items-center justify-center">
                      No products found in the latest collection.
                    </div>
                  )}
                </Swiper>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}