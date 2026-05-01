"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { products as staticProducts } from "../data/products";
import { useCurrency } from "../context/CurrencyContext";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import DirectAddToCart from "./DirectAddToCart";

export default function ProductGrid() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Update this to your actual image storage path
  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/proxy/products/category/radhe-rani");
        const json = await response.json();

        if (json.products && Array.isArray(json.products)) {
          setProducts(json.products);
        }
      } catch (error) {
        console.error("Error fetching Radha Rani products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-[#FDF8F3]">
        <Loader2 className="animate-spin text-[#7A1F3D]" size={40} />
      </div>
    );
  }

  // Repeater logic: if products are 3 or less, repeat them to make the carousel functional
  const displayProducts = (products.length > 0 && products.length <= 3)
    ? [...products, ...products, ...products]
    : products;

  return (
    <section id="radha-krishna-section" className="mx-auto max-w-[1720px] bg-[#FDF8F3] pt-6 sm:pt-10 md:pt-12 pb-10 sm:pb-16 md:pb-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 md:px-16 lg:px-24">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 md:mb-14">
          <h2 className="text-[20px] sm:text-[32px] md:text-[36px] font-playfair font-semibold text-[#303030]">
            Radha Krishna ji Dresses
          </h2>

          <div className="flex gap-2 sm:gap-3 self-start sm:self-auto">
            <button className="rk-prev w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-[#D6D6D6] rounded-full  hover:text-white transition cursor-pointer">
              <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20ranii.png'></img>
            </button>
            <button className="rk-next w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full  text-white  transition cursor-pointer">
              <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20rani.png'></img>
            </button>
          </div>
        </div>

        {/* CAROUSEL */}
        <Swiper
          modules={[Navigation]}
          navigation={{ prevEl: ".rk-prev", nextEl: ".rk-next" }}
          spaceBetween={12}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 1.2, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          className="w-full"
        >

          {displayProducts.map((product, index) => (
            <SwiperSlide key={`${product.id}-${index}`} className="!h-auto flex">
              <div className="bg-white w-full max-w-[400px] min-h-[480px] sm:min-h-[600px] flex flex-col shadow-sm hover:shadow-md transition overflow-hidden mx-auto cursor-pointer group rounded-sm border border-[#E8DDD4] flex-1">

                {/* IMAGE */}
                <div className="w-full aspect-[1/1] bg-[#FDF8F3] overflow-hidden">
                  <img
                    src={product.image_path?.startsWith('http') ? product.image_path : `${IMAGE_BASE_URL}${product.image_path}`}
                    alt={product.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === product.name.toLowerCase() || p.slug === product.slug);
                      e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[product.id % staticProducts.length].image;
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4 md:p-6 flex flex-col flex-1">
                  <h4 className="text-[16px] md:text-[21px] font-medium text-[#303030] mb-0.5 md:mb-2 line-clamp-1 group-hover:text-[#7A1F3D] transition-colors min-h-[1.5em]">
                    {product.name}
                  </h4>
                  <p className="text-[12px] md:text-[14px] text-gray-600 mb-2 md:mb-4 line-clamp-2 min-h-[3em] md:min-h-[3.5em]">
                    {product.short_description}
                  </p>
                  <p className="text-[18px] md:text-[24px] font-bold text-[#7A1F3D] mb-3 md:mb-5">
                    {formatPrice(product.price, product.usd_price)}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <Link href={`/product-details/${product.slug}`} className="w-full">
                      <button className="w-full h-[42px] flex items-center justify-center bg-[#7A1F3D] border border-[#7A1F3D] text-white text-[13px] md:text-[14px] font-medium hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 cursor-pointer">
                        Shop Now
                      </button>
                    </Link>
                    <DirectAddToCart product={product} />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}