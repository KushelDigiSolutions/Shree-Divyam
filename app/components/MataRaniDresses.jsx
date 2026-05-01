"use client";

import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { products as staticProducts } from "../data/products";
import { useCurrency } from "../context/CurrencyContext";

// Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import DirectAddToCart from "./DirectAddToCart";

export default function MataRaniDresses() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice } = useCurrency();

  // Update this to your actual image storage path
  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/proxy/products/category/mata-rani");
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
    <section id="mata-rani-section" className="mx-auto max-w-[1720px] w-full bg-[#F8F6F3] py-10 sm:py-14 md:py-16 lg:py-[54px]">
      <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between lg:mb-11">
          <h2 className="text-[20px] sm:text-[32px] md:text-[36px] lg:text-[40px] font-semibold font-playfair leading-tight text-[#303030]">
            Mata Rani ji Dresses
          </h2>

          <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-auto">
            <button className="mr-prev flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-[#B96882] bg-transparent text-[#B96882] transition  hover:text-white cursor-pointer">
           <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20ranii.png'></img>
            </button>
            <button className="mr-next flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full  text-white transition  cursor-pointer">
              <img src='https://res.cloudinary.com/dlzxiy0tl/image/upload/v1777294947/mata%20rani.png'></img>
            </button>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_404px] lg:gap-8">
          {/* Product cards CAROUSEL */}
          <div className="overflow-hidden min-w-0">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation={{
                prevEl: ".mr-prev",
                nextEl: ".mr-next",
              }}
              spaceBetween={12}
              slidesPerView={1}
              autoplay={{ delay: 4000 }}
              breakpoints={{
                480: { slidesPerView: 1.2, spaceBetween: 16 },
                640: { slidesPerView: 1.5, spaceBetween: 20 },
                768: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 2, spaceBetween: 24 },
                1280: { slidesPerView: 2, spaceBetween: 30 },
              }}
              className="w-full !pb-2"
            >

              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <div className="overflow-hidden bg-white ring-1 ring-[#EFEAE4] h-full lg:h-[540px] flex flex-col cursor-pointer group rounded-sm shadow-sm">
                    <div className="p-[8px] sm:p-[10px] pb-0">
                      <div className="aspect-[1/1] w-full h-auto max-h-[280px] overflow-hidden bg-white">
                        <img
                          src={product.image_path?.startsWith('http') ? product.image_path : `${IMAGE_BASE_URL}${product.image_path}`}
                          alt={product.name}
                          className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            const fallbackProduct = staticProducts.find((p) => p.title.toLowerCase() === product.name.toLowerCase() || p.slug === product.slug);
                            e.target.src = fallbackProduct ? fallbackProduct.image : staticProducts[product.id % staticProducts.length].image;
                          }}
                        />
                      </div>
                    </div>

                    <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 flex flex-col flex-1">
                      <h3 className="text-[16px] sm:text-[19px] md:text-[21px] font-medium leading-[1.25] font-gt-walsheim text-[#303030] group-hover:text-[#7A1F3D] transition-colors line-clamp-1">
                        {product.name}
                      </h3>

                      <p className="mt-2 sm:mt-3 text-[12px] sm:text-[14px] leading-[1.45] font-gt-walsheim text-gray-600 line-clamp-2">
                        {product.short_description}
                      </p>

                      <div className="mt-auto pt-4">
                        <p className="text-[18px] sm:text-[22px] md:text-[24px] font-bold font-gt-walsheim text-[#7A1F3D] mb-2 sm:mb-3">
                          {formatPrice(product.price, product.usd_price)}
                        </p>

                        <div className="flex flex-col gap-2 min-[480px]:flex-row">
                          <Link href={`/product-details/${product.slug}`} className="flex-1">
                            <button className="w-full h-[42px] flex items-center justify-center border border-[#7A1F3D] bg-[#7A1F3D] text-[13px] md:text-[14px] font-gt-walsheim font-medium text-white transition-all duration-300 hover:bg-white hover:text-[#7A1F3D] cursor-pointer">
                              Shop Now
                            </button>
                          </Link>
                          <div className="flex-1">
                            <DirectAddToCart product={product} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Promo card */}
          <div className="relative min-h-[300px] w-full lg:w-[300px] xl:w-[404px] h-[300px] sm:h-[400px] lg:h-[540px] overflow-hidden bg-white lg:bg-transparent ring-1 ring-[#EFEAE4] rounded-sm shadow-sm">
            <img
              src={products?.[0]?.image_path ? (products[0].image_path.startsWith('http') ? products[0].image_path : `${IMAGE_BASE_URL}${products[0].image_path}`) : "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png"}
              alt="Premium dress collection"
              className="h-full w-full object-cover lg:p-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://res.cloudinary.com/dlzxiy0tl/image/upload/v1774856926/krishna-image.png";
              }}
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-black/10" />

            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-7 sm:right-7">
              <h3 className="max-w-[350px] font-playfair text-[24px] font-medium leading-tight text-white sm:text-[34px] lg:text-[28px] xl:text-[33px]">
                Get Premium Dress collection for Radha Krishna
              </h3>

              <Link href="/category/mata-rani">
                <button className="mt-4 inline-flex items-center gap-2 bg-white px-6 py-2.5 text-[14px] sm:text-[15px] font-medium text-[#000000] transition-all duration-300  cursor-pointer rounded-sm shadow-sm">
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
