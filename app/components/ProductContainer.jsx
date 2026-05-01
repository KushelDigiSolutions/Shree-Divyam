"use client";

import { useState, useRef, useEffect } from "react";
import ProductInfo from "./ProductInfo";
import ProductGallery from "./ProductGallery";

export default function ProductContainer({ product }) {
  // Find a default variant that is in stock to avoid starting on an "Out of Stock" selection
  const inStockVariant = product.variations?.find(v => Number(v.stock) > 0) || product.variations?.[0];
  
  const [selectedSize, setSelectedSize] = useState(inStockVariant?.size || product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(inStockVariant?.color || product.colors[0]);
  const galleryRef = useRef(null);
  const [galleryHeight, setGalleryHeight] = useState(null);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setGalleryHeight(entry.contentRect.height);
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const activeVariation = product.variations?.find(v => v.color === selectedColor && v.size === selectedSize);
  const fallbackVariation = product.variations?.find(v => v.color === selectedColor) || product.variations?.[0];
  const variation = activeVariation || fallbackVariation;
  const stock = variation?.stock;

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-[0.9fr_1.23fr_0.87fr] lg:gap-8 gap-12 items-stretch">
      {/* 2. Gallery (Shows 1st on mobile) */}
      <div ref={galleryRef} className="w-full order-1 lg:order-2">
        <ProductGallery images={product.images} />
      </div>

      {/* 1. Info (Shows 2nd on mobile) */}
      <div className="w-full order-2 lg:order-1">
        <ProductInfo
          product={product}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          selectedSize={selectedSize}
          setSelectedSize={setSelectedSize}
        />
      </div>

      {/* 3. Details (Shows 3rd on mobile) */}
      <div
        className="w-full order-3 lg:order-3 lg:pl-2 px-4 sm:px-6 lg:px-0"
        style={galleryHeight && typeof window !== 'undefined' && window.innerWidth >= 1024 ? { maxHeight: galleryHeight } : undefined}
      >
        <div className="border border-[#ddd2c4] bg-[#FFF6F9] p-6 sm:p-7 h-full rounded-sm shadow-sm transition-all">
          <h2 className="border-b border-[#ded6ca] pb-3 text-[22px] sm:text-[28px] font-medium text-[#4a3b33] font-playfair">
            Product Details
          </h2>

          <div className="space-y-3 pt-5 text-[14px] sm:text-[16px] md:text-[18px] leading-relaxed text-[#4c4742]">

            {product.category && product.category !== "N/A" && (
              <p>
                <span className="font-semibold text-[#303030] font-gt-walsheim">Product Code :</span>{" "}
                {product.category}
              </p>
            )}
            {product.type && product.type !== "N/A" && (
              <p>
                <span className="font-semibold text-[#303030] font-gt-walsheim">Type :</span> {product.type}
              </p>
            )}
            <p>
              <span className="font-semibold text-[#303030] font-gt-walsheim">Color :</span> {selectedColor}
            </p>
            {product.material && product.material !== "Premium Material" && (
              <p>
                <span className="font-semibold text-[#303030] font-gt-walsheim">Material :</span> {product.material}
              </p>
            )}
            {product.work && product.work !== "Standard" && (
              <p>
                <span className="font-semibold text-[#303030] font-gt-walsheim">Work :</span> {product.work}
              </p>
            )}
            {product.packaging && product.packaging !== "Standard" && (
              <p>
                <span className="font-semibold text-[#303030] font-gt-walsheim">Packaging :</span> {product.packaging}
              </p>
            )}
            {product.care && product.care !== "See label" && (
              <p>
                <span className="font-semibold text-[#303030] font-gt-walsheim">Care :</span> {product.care}
              </p>
            )}
            {stock !== undefined && stock !== null && (
              <p>
                <span className="font-semibold text-[#303030] font-gt-walsheim">Stock :</span>{" "}
                {stock > 0 ? `${stock} In Stock` : "Out of Stock"}
              </p>
            )}

            {product.description && (
              <div className="pt-4 text-[14px] sm:text-[15px] leading-relaxed text-gray-600 border-t border-[#e6ddd2] mt-4">
                <p>
                  <span className="font-semibold text-[#303030] font-gt-walsheim">Disclaimer :</span>{" "}
                  {product.description}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

