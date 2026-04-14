"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { products as staticProducts } from "../data/products";
import { useCurrency } from "../context/CurrencyContext";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";

export default function MataRaniDresses() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Update this to your actual image storage path
  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://shreedivyam.kdscrm.com/api/products/category/mata-rani");
        const json = await response.json();
        
        if (json.products && Array.isArray(json.products)) {
          setProducts(json.products);
        }
      } catch (error) {
        console.error("Error fetching Mata Rani products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-[#F8F6F3]">
        <Loader2 className="animate-spin text-[#7A1F3D]" size={40} />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-[1720px] w-full bg-[#F8F6F3] py-12 sm:py-14 md:py-16 lg:py-[54px]">
      <div className="mx-auto max-w-[1440px] px-8 md:px-16 lg:px-24">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-center sm:justify-between lg:mb-11">
          <h2 className="text-[40px] font-semibold  font-playfair leading-none text-[#303030] sm:text-[34px] lg:text-[40px] ">
            Mata Rani ji Dresses
          </h2>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button className="mr-prev flex h-9 w-9 items-center justify-center rounded-full border border-[#B96882] bg-transparent text-[#B96882] transition hover:bg-[#7A1F3D] hover:text-white sm:h-10 sm:w-10 cursor-pointer">
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <button className="mr-next flex h-9 w-9 items-center justify-center rounded-full bg-[#8B1E4D] text-white transition hover:bg-[#6F173D] sm:h-10 sm:w-10 cursor-pointer">
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
          {/* Product cards CAROUSEL */}
          <div className="overflow-hidden min-w-0">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{
                prevEl: ".mr-prev",
                nextEl: ".mr-next",
              }}
              spaceBetween={30}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2 },
              }}
              className="w-full"
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="overflow-hidden bg-white ring-1 ring-[#EFEAE4] h-full lg:h-[540px] flex flex-col">
                    <div className="p-[10px] pb-0">
                      <div className="aspect-[1/0.84] w-full h-auto max-h-[280px] overflow-hidden bg-[#F3F3F3]">
                        <img
                          src={product.image_path?.startsWith('http') ? product.image_path : `${IMAGE_BASE_URL}${product.image_path}`}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === product.name.toLowerCase() || p.slug === product.slug);
                            e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[product.id % staticProducts.length].image;
                          }}
                        />
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 flex flex-col flex-1">
                      <h3 className="text-[21px] font-medium leading-[1.25]  font-gt-walsheim text-[#303030]">
                        {product.name}
                      </h3>

                      <p className="mt-1.5 text-[14px] leading-[1.45] font-gt-walsheim font-right line-clamp-2 text-[#303030]">
                        {product.short_description}
                      </p>

                      <p className="mt-3 text-[24px] font-bold font-gt-walsheim text-[#7A1F3D]">
                        {formatPrice(product.price, product.usd_price)}
                      </p>

                      <div className="mt-auto pt-4 flex flex-col gap-3 min-[480px]:flex-row">
                        <Link href={`/product-details/${product.slug}`} className="flex-1">
                          <button className="w-full border border-[#7A1F3D] bg-[#7A1F3D] px-4 py-3 text-[14px] font-gt-walsheim font-medium text-white transition hover:bg-[#5E182F]">
                            Shop Now
                          </button>
                        </Link>
                        <button className="flex-1 border border-[#C78599] bg-white px-4 py-3 text-[14px] font-medium text-[#7A1F3D] transition hover:bg-[#FAF2F5]">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Promo card */}
          <div className="relative min-h-[420px] w-full lg:w-[404px] h-[400px] lg:h-[540px] overflow-hidden bg-white ring-1 ring-[#EFEAE4] sm:min-h-[470px] lg:min-h-0">
            <img
              src="https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png"
              alt="Premium dress collection"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />

            <div className="absolute bottom-7 left-6 right-6 sm:bottom-8 sm:left-7 sm:right-7">
              <h3 className="max-w-[350px] font-playfair text-[28px] font-medium leading-[1.08] text-white sm:text-[34px] lg:text-[31px] xl:text-[33px]">
                Get Premium Dress collection for Radha Krishna
              </h3>

              <Link href="/category/mata-rani">
                <button className="mt-5 inline-flex items-center gap-2 bg-white px-5 py-3 text-[15px] font-medium text-[#1F1F1F] transition hover:bg-[#F3F3F3]">
                  View All
                  <ArrowRight size={16} />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}