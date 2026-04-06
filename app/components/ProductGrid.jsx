"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import Link from "next/link";
import { products } from "../data/products";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

export default function ProductGrid() {
  const filteredProducts = products.filter(p => p.category === "radha-krishna");

  return (
    <section className="mx-auto max-w-[1720px] bg-[#FDF8F3] py-14 sm:py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-8 md:px-16 lg:px-24">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 md:mb-14">

          <h2 className="text-[41px] sm:text-[30px] md:text-[36px] font-playfair font-semibold text-[#303030]">
            Radha Krishna ji Dresses
          </h2>

          <div className="flex gap-3 self-start sm:self-auto">
            <button className="rk-prev w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-[#D6D6D6] rounded-full hover:bg-[#7A1F3D] hover:text-white transition cursor-pointer">
              <ChevronLeft size={18} />
            </button>

            <button className="rk-next w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#7A1F3D] text-white hover:bg-[#5E182F] transition cursor-pointer">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* CAROUSEL */}
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation={{
            prevEl: ".rk-prev",
            nextEl: ".rk-next",
          }}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="w-full"
        >
          {filteredProducts.map((product) => (
            <SwiperSlide key={product.id}>
              <div className="bg-white w-full max-w-[400px] h-auto min-h-[500px] shadow-sm hover:shadow-md transition overflow-hidden flex flex-col mx-auto">

                {/* IMAGE */}
                <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-1">

                  <h4 className="font-gt-walsheim text-[21px] sm:text-[17px] md:text-[21px] font-medium text-[#303030] mb-2">
                    {product.title}
                  </h4>

                  <p className="font-gt-walsheim text-[14px] sm:text-[14px] text-[#303030] font-right mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <p className="text-[18px] sm:text-[19px] md:text-[24px] font-bold text-[#7A1F3D] mb-4">
                    {product.price}
                  </p>

                  {/* BUTTONS */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-auto">

                    <Link href={`/product-details/${product.slug}`} className="w-full">
                      <button className="w-full bg-[#7A1F3D] text-white py-2.5 text-[13px] sm:text-[14px] font-gt-walsheim font-medium hover:bg-[#5E182F] transition">
                        Shop Now
                      </button>
                    </Link>

                    <button className="w-full border border-[#7A1F3D] text-[#7A1F3D] py-2.5 text-[13px] sm:text-[14px] font-gt-walsheim font-medium hover:bg-[#7A1F3D]/10 transition">
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