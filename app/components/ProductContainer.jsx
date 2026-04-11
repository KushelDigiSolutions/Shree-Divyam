"use client";

import { useState } from "react";
import ProductInfo from "./ProductInfo";
import ProductGallery from "./ProductGallery";

export default function ProductContainer({ product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);

  return (
    <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1.05fr_1fr_0.95fr]">
      <ProductInfo 
        product={product} 
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />
      <ProductGallery images={product.images} />
      <div className="lg:pl-2">
        <div className="border border-[#ddd2c4] bg-white p-5">
          <h2 className="border-b border-[#ded6ca] pb-3 text-[28px] font-medium text-[#4a3b33]">
            Product Details
          </h2>

          <div className="space-y-3 pt-4 text-[14px] leading-6 text-[#4c4742]">
            <p>
              <span className="font-semibold text-[#6f5a4d]">Product Code :</span>{" "}
              {product.category}
            </p>
            <p>
              <span className="font-semibold text-[#6f5a4d]">Type :</span> {product.type}
            </p>
            <p>
              <span className="font-semibold text-[#6f5a4d]">Color :</span> {selectedColor}
            </p>
            <p>
              <span className="font-semibold text-[#6f5a4d]">Material :</span> {product.material}
            </p>
            <p>
              <span className="font-semibold text-[#6f5a4d]">Work :</span> {product.work}
            </p>
            <p>
              <span className="font-semibold text-[#6f5a4d]">Packaging :</span> {product.packaging}
            </p>
            <p>
              <span className="font-semibold text-[#6f5a4d]">Care :</span> {product.care}
            </p>

            <p className="pt-1 text-[13px] leading-6 text-[#6d6258]">
              <span className="font-semibold text-[#6f5a4d]">Disclaimer :</span>{" "}
              {product.description}
            </p>

            <div className="border-t border-[#e6ddd2] pt-3">
              <p className="mb-2 text-[13px] font-semibold text-[#6f5a4d]">
                Safe Checkout
              </p>
              <div className="flex items-center gap-2 text-[12px] text-[#3b5ea8]">
                <span className="rounded bg-[#f5f5f5] px-2 py-1 font-semibold text-[#1a4fb8]">
                  VISA
                </span>
                <span className="rounded bg-[#f5f5f5] px-2 py-1 font-semibold text-[#d4382c]">
                  ● ●
                </span>
                <span className="rounded bg-[#f5f5f5] px-2 py-1 font-semibold text-[#179bd7]">
                  PayPal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
