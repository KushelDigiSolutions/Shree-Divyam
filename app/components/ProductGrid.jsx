"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { products as staticProducts } from "../data/products";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update this to your actual image storage path
  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://shreedivyam.kdscrm.com/api/products/category/radhe-rani");
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

  return (
    <section className="mx-auto max-w-[1720px] bg-[#FDF8F3] py-14 sm:py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 md:mb-14">
          <h2 className="text-[32px] md:text-[36px] font-playfair font-semibold text-[#303030]">
            Radha Krishna ji Dresses
          </h2>

          <div className="flex gap-3 self-start sm:self-auto">
            <button className="rk-prev w-10 h-10 flex items-center justify-center border border-[#D6D6D6] rounded-full hover:bg-[#7A1F3D] hover:text-white transition cursor-pointer">
              <ChevronLeft size={18} />
            </button>
            <button className="rk-next w-10 h-10 flex items-center justify-center rounded-full bg-[#7A1F3D] text-white hover:bg-[#5E182F] transition cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CAROUSEL */}
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{ prevEl: ".rk-prev", nextEl: ".rk-next" }}
          spaceBetween={30}
          slidesPerView={1}
          autoplay={{ delay: 4000 }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="w-full"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="bg-white w-full max-w-[400px] h-full min-h-[545px] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col mx-auto">
                
                {/* IMAGE */}
                <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={product.image_path?.startsWith('http') ? product.image_path : `${IMAGE_BASE_URL}${product.image_path}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Fallback to the image present in our static data based on name or slug
                      const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === product.name.toLowerCase() || p.slug === product.slug);
                      
                      // If specific match not found, use a consistent fallback from staticProducts
                      e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[product.id % staticProducts.length].image;
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5 md:p-6 flex flex-col flex-1">
                  <h4 className="text-[19px] md:text-[21px] font-medium text-[#303030] mb-2 line-clamp-1">
                    {product.name}
                  </h4>
                  <p className="text-[14px] text-gray-600 mb-4 line-clamp-2">
                    {product.short_description}
                  </p>
                  <p className="text-[22px] md:text-[24px] font-bold text-[#7A1F3D] mb-5">
                    {product.currency === "INR" ? "₹" : product.currency}{product.price}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                    <Link href={`/product-details/${product.slug}`} className="w-full">
                      <button className="w-full bg-[#7A1F3D] text-white py-2.5 text-[14px] font-medium hover:bg-[#5E182F] transition">
                        Shop Now
                      </button>
                    </Link>
                    <button className="w-full border border-[#7A1F3D] text-[#7A1F3D] py-2.5 text-[14px] font-medium hover:bg-[#7A1F3D]/10 transition">
                      Add to Cart
                    </button>
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