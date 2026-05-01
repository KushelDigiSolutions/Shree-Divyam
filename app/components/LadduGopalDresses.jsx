"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter} from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { products as staticProducts } from "../data/products";
import { useCurrency } from "../context/CurrencyContext";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import DirectAddToCart from "./DirectAddToCart";

export default function LadduGopalDresses() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Update this to your actual image storage path
  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/proxy/products/category/laddu-gopal");
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

  // Repeater logic: if products are 3 or less, repeat them to make the carousel functional
  const displayProducts = (products.length > 0 && products.length <= 3)
    ? [...products, ...products, ...products]
    : products;

  return (
    <section id="laddu-gopal-section" className="mx-auto max-w-[1720px] bg-[#FEF5E6] py-10 sm:py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 md:px-16 lg:px-24">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 md:mb-14">
          <h2 className="text-[20px] sm:text-[32px] md:text-[36px] lg:text-[40px] font-playfair font-semibold text-[#303030]">
            Laddu Gopal ji Dresses
          </h2>

          <div className="flex gap-2 sm:gap-3 self-start sm:self-auto">
            <button className="lg-prev w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-[#D6D6D6] rounded-full  hover:text-white transition cursor-pointer">
            <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20ranii.png'></img>
            </button>
            <button className="lg-next w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full  text-white  transition cursor-pointer">
<img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20rani.png'></img>
            </button>
          </div>
        </div>

        {/* CAROUSEL */}
        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: ".lg-prev",
            nextEl: ".lg-next",
          }}
          spaceBetween={12}
          slidesPerView={1}
          breakpoints={{
            480: { slidesPerView: 1.2, spaceBetween: 16 },
            640: { slidesPerView: 2, spaceBetween: 20 },
            1024: { slidesPerView: 3, spaceBetween: 30 },
          }}
          className="w-full !pb-2"
        >

          {displayProducts.map((dress, index) => (
            <SwiperSlide key={`${dress.id}-${index}`}>
              <div className="group bg-white border border-[#E8DDD4] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col h-full cursor-pointer rounded-sm">

                {/* IMAGE */}
                <div className="w-full aspect-[1/1] bg-[#F7F1EB] overflow-hidden">
                  <img
                    src={dress.image_path?.startsWith('http') ? dress.image_path : `${IMAGE_BASE_URL}${dress.image_path}`}
                    alt={dress.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === dress.name.toLowerCase() || p.slug === dress.slug);
                      e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[dress.id % staticProducts.length].image;
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">
                  <h3 className="text-[15px] sm:text-[19px] md:text-[22px] lg:text-[24px] font-medium font-gt-walsheim text-[#303030] mb-2 sm:mb-3 group-hover:text-[#7A1F3D] transition-colors line-clamp-1">
                    {dress.name}
                  </h3>
                  <p className="text-[12px] sm:text-[14px] text-gray-600 font-gt-walsheim mb-4 md:mb-5 line-clamp-2">
                    {dress.short_description}
                  </p>
                  
                  <div className="mt-auto pt-2">
                    <p className="text-[18px] sm:text-[22px] md:text-[24px] font-bold text-[#7A1F3D] mb-2 sm:mb-3">
                      {formatPrice(dress.price, dress.usd_price)}
                    </p>

                    <div className="flex flex-col gap-2">
                      <Link href={`/product-details/${dress.slug}`} className="w-full">
                        <button className="w-full bg-[#7A1F3D] border border-[#7A1F3D] text-white py-2 md:py-2.5 text-[13px] md:text-[14px] font-gt-walsheim font-medium hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 cursor-pointer">
                          Shop Now
                        </button>
                      </Link>
                      <DirectAddToCart product={dress} />
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* VIEW ALL */}
        <div className="mt-8 md:mt-10 text-center">
          <Link
            href="/category/laddu-gopal"
            className="inline-flex"
          >
            <button className="bg-white border border-[#7A1F3D] text-[#7A1F3D] px-8 py-2.5 text-[15px] font-medium font-playfair hover:bg-[#7A1F3D] hover:text-white transition-all duration-300 cursor-pointer rounded-sm shadow-sm">
              View All
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

