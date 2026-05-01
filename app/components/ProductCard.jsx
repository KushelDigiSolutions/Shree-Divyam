"use client";

import Image from "next/image";
import { useCurrency } from "../context/CurrencyContext";
import DirectAddToCart from "./DirectAddToCart";

export default function ProductCard({ product }) {
  const { formatPrice } = useCurrency();

  return (
    <div className="overflow-hidden bg-white ring-1 ring-[#EFEAE4] h-full flex flex-col cursor-pointer group rounded-sm shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="p-[8px] sm:p-[10px] pb-0">
        <div className="relative aspect-[1/1] w-full overflow-hidden bg-white rounded-sm">
          <Image
            src={product.image || "https://placehold.co/400x400?text=No+Image"}
            alt={product.title}
            fill
            className="object-contain p-1 transition-transform duration-700 group-hover:scale-105"
            unoptimized={true}
          />
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 sm:px-5 sm:pb-5 flex flex-col flex-1">
        <h3 className="text-[16px] sm:text-[19px] md:text-[21px] font-medium leading-[1.25] font-gt-walsheim text-[#303030] group-hover:text-[#7A1F3D] transition-colors line-clamp-1 min-h-[1.25em]">
          {product.title}
        </h3>

        <div className="min-h-[2.9em] mt-2 sm:mt-3">
          <p className="text-[12px] sm:text-[14px] leading-[1.45] font-gt-walsheim text-gray-600 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="mt-auto pt-4">
          <p className="text-[18px] sm:text-[22px] md:text-[24px] font-bold font-gt-walsheim text-[#7A1F3D] mb-2 sm:mb-3">
            {formatPrice(product.price, product.usdPrice)}
          </p>

          <div className="grid grid-cols-2 gap-2 sm:gap-3 relative z-20">
            <button 
              className="w-full h-[40px] flex items-center justify-center border border-[#7A1F3D] bg-[#7A1F3D] text-[13px] md:text-[14px] font-gt-walsheim font-medium text-white transition-all duration-300 hover:bg-white hover:text-[#7A1F3D] cursor-pointer"
            >
              Shop Now
            </button>
            <DirectAddToCart product={product} className="!h-[40px] !text-[13px] md:!text-[14px]" />
          </div>
        </div>
      </div>
    </div>

  );
}