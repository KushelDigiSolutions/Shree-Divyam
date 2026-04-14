"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { products as staticProducts } from "../data/products";
import { useCurrency } from "../context/CurrencyContext";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default function LadduGopalDresses() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Update this to your actual image storage path
  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://shreedivyam.kdscrm.com/api/products/category/laddu-gopal");
        const json = await response.json();
        
        if (json.products && Array.isArray(json.products)) {
          setProducts(json.products);
        }
      } catch (error) {
        console.error("Error fetching Laddu Gopal products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-[#FEF5E6]">
        <Loader2 className="animate-spin text-[#7A1F3D]" size={40} />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1720px] bg-[#FEF5E6] py-14 sm:py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 md:mb-14">

          <h2 className="text-[26px] sm:text-[30px] md:text-[40px] font-playfair font-semibold text-[#303030]">
            Laddu Gopal ji Dresses
          </h2>

          <div className="flex gap-3">
            <button className="lg-prev w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border border-[#D6D6D6] bg-white hover:bg-[#7A1F3D] hover:text-white transition cursor-pointer">
              <ChevronLeft size={18} />
            </button>

            <button className="lg-next w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#7A1F3D] text-white hover:bg-[#5E182F] transition cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CAROUSEL */}
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: ".lg-prev",
            nextEl: ".lg-next",
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="w-full"
        >
          {products.map((dress) => (
            <SwiperSlide key={dress.id}>
              <div className="group bg-white border border-[#E8DDD4] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full">

                {/* IMAGE */}
                <div className="w-full aspect-[4/3] bg-[#F7F1EB] overflow-hidden">
                  <img
                    src={dress.image_path?.startsWith('http') ? dress.image_path : `${IMAGE_BASE_URL}${dress.image_path}`}
                    alt={dress.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      // Fallback to the image present in our static data based on name or slug
                      const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === dress.name.toLowerCase() || p.slug === dress.slug);
                      
                      // If specific match not found, use a consistent fallback from staticProducts
                      e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[dress.id % staticProducts.length].image;
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-5 sm:p-6 flex flex-col flex-1">

                  <h3 className="text-[16px] sm:text-[17px] md:text-[24px] font-medium font-gt-walsheim text-[#303030] mb-2">
                    {dress.name}
                  </h3>

                  <p className="text-[13px] sm:text-[16px] text-[#303030] font-right font-gt-walsheim mb-3 line-clamp-2">
                    {dress.short_description}
                  </p>

                  <p className="text-[18px] sm:text-[19px] md:text-[24px] font-bold text-[#7A1F3D] mb-4">
                    {formatPrice(dress.price, dress.usd_price)}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">

                    <Link href={`/product-details/${dress.slug}`} className="w-full">
                      <button className="w-full bg-[#7A1F3D] text-white py-2.5 text-[13px] sm:text-[16px] font-gt-walsheim font-medium hover:bg-[#5E182F] transition">
                        Shop Now
                      </button>
                    </Link>

                    <button className="w-full border border-[#7A1F3D] text-[#7A1F3D] py-2.5 text-[13px] sm:text-[16px] font-gt-walsheim font-medium hover:bg-[#7A1F3D]/10 transition">
                      Add to Cart
                    </button>

                  </div>

                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* VIEW ALL */}
        <div className="mt-10 text-center">
          <Link
            href="/category/laddu-gopal"
            className="text-[18px] sm:text-[20px] font-semibold font-playfair text-[#7A1F3D] hover:underline"
          >
            View All
          </Link>
        </div>

      </div>
    </section>
  );
}