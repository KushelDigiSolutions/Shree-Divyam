"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { products as staticProducts } from "../data/products";
import { useCurrency } from "../context/CurrencyContext";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import DirectAddToCart from "./DirectAddToCart";


export default function LatestCollection() {
  const router = useRouter();
  const [latestProducts, setLatestProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";
  const firstProduct = latestProducts?.[0];
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetch("/api/proxy/products");
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
    <section className="mx-auto max-w-[1720px] bg-[#F5F5F7] pt-12 md:pt-20 pb-4 md:pb-8">
      <div className="max-w-[1720px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* LEFT BANNER */}
          <div className="relative w-full lg:w-[584px] h-[300px] sm:h-[400px] lg:h-[600px] overflow-hidden group bg-white lg:bg-transparent ring-1 ring-gray-200 lg:ring-0">
            <img
    src={
      firstProduct?.image_path?.startsWith("http")
        ? firstProduct.image_path
        : `${IMAGE_BASE_URL}${firstProduct?.image_path}`
    }
    alt={firstProduct?.name || "Banner"}
    className="w-full h-full object-contain lg:object-cover lg:p-0 transition-transform duration-700 group-hover:scale-105"
  />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Text */}
            <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-12">
              <h3 className="text-[18px] sm:text-[28px] lg:text-[40px] leading-tight font-serif text-white mb-4 md:mb-8">
                Let Your Love <br className="hidden sm:block" /> Tick Forever
              </h3>

              {firstProduct ? (
                <Link href={`/product-details/${firstProduct.slug}`}>
                  <button className="flex items-center gap-2 bg-white text-black px-5 sm:px-6 py-2.5 sm:py-3 w-fit text-[14px] sm:text-[15px] font-medium hover:bg-gray-100 transition cursor-pointer">
                    Shop Now <ArrowRight size={18} />
                  </button>
                </Link>
              ) : (
                <button className="flex items-center gap-2 bg-white text-black px-5 sm:px-6 py-2.5 sm:py-3 w-fit text-[14px] sm:text-[15px] font-medium hover:bg-gray-100 transition opacity-80">
                  Shop Now <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="w-full lg:flex-1 min-w-0 flex flex-col">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h2 className="text-[18px] sm:text-[26px] lg:text-[32px] font-playfair font-semibold text-[#303030]">
                Latest Collection
              </h2>

              <div className="flex gap-2 sm:gap-3">
                <button className="swiper-button-prev-custom w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-gray-300 rounded-full  hover:text-white transition cursor-pointer">
                  <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20ranii.png'></img>
                </button>

                <button className="swiper-button-next-custom w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full  text-white  transition cursor-pointer">
                  <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20rani.png'></img>
                </button>
              </div>
            </div>

            {/* CONTENT AREA */}
            <div className="relative flex-1 min-h-[450px] sm:min-h-[500px]">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="animate-spin text-[#7A1F3D]" size={36} />
                </div>
              ) : (
                <Swiper
                  modules={[Navigation]}
                  navigation={{
                    prevEl: ".swiper-button-prev-custom",
                    nextEl: ".swiper-button-next-custom",
                  }}
                  spaceBetween={12}
                  slidesPerView={1}
                  breakpoints={{
                    480: { slidesPerView: 1.3, spaceBetween: 16 },
                    640: { slidesPerView: 1.7, spaceBetween: 20 },
                    1024: { slidesPerView: 2.05, spaceBetween: 30 },
                    1280: { slidesPerView: 2.1, spaceBetween: 40 },
                  }}
                  className="w-full h-full pb-10"
                >

                  {latestProducts.map((product) => (
                    <SwiperSlide key={product.id}>
                      <div className="bg-white p-1.5 w-full max-w-[550px] h-auto min-h-[420px] sm:min-h-[500px] shadow-sm hover:shadow-lg transition-all duration-300 mx-auto  flex flex-col cursor-pointer group rounded-sm border border-[#E8DDD4]">
                        {/* IMAGE */}
                        <div className="w-full h-[280px] bg-gray-50 overflow-hidden mb-4 sm:mb-6">
                          <img
                            src={product.image_path?.startsWith('http') ? product.image_path : `${IMAGE_BASE_URL}${product.image_path}`}
                            alt={product.name}
                            className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === product.name.toLowerCase() || p.slug === product.slug);
                              e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[product.id % staticProducts.length].image;
                            }}
                          />
                        </div>

                        {/* CONTENT */}
                        <div className="px-2 flex flex-col flex-1">
                          <h4 className="text-[16px] sm:text-[21px] font-gt-walsheim font-medium text-[#303030] mb-0.5 leading-tight line-clamp-1 group-hover:text-[#7A1F3D] transition-colors">
                            {product.name}
                          </h4>

                          <p className="text-[12px] sm:text-[14px] font-gt-walsheim text-[#303030] mb-1.5 line-clamp-2">
                            {product.short_description || "Premium exclusive collection piece."}
                          </p>

                          <p className="text-[18px] sm:text-[24px] font-bold text-[#7A1F3D] mb-3 sm:mb-6">
                            {formatPrice(product.price, product.usd_price)}
                          </p>

                          <div className="flex gap-3 mt-auto">
                            <Link href={`/product-details/${product.slug}`} className="flex-1">
                              <button className="w-full h-[42px] flex items-center justify-center bg-[#7A1F3D] border border-[#7A1F3D] text-white text-[14px] font-semibold hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 cursor-pointer">
                                Shop Now
                              </button>
                            </Link>

                            <div className="flex-1">
                              <DirectAddToCart product={product} />
                            </div>
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