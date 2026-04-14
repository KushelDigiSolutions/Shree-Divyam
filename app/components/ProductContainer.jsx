"use client";

import { useState, useRef, useEffect } from "react";
import ProductInfo from "./ProductInfo";
import ProductGallery from "./ProductGallery";

export default function ProductContainer({ product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
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
    <div className="grid gap-8 grid-cols-1 lg:grid-cols-[0.9fr_1.2fr_0.9fr] items-start">
      <ProductInfo
        product={product}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        selectedSize={selectedSize}
        setSelectedSize={setSelectedSize}
      />
      <div ref={galleryRef}>
        <ProductGallery images={product.images} />
      </div>
      <div
        className="lg:pl-2 overflow-y-auto"
        style={galleryHeight ? { maxHeight: galleryHeight } : undefined}
      >
        <div className="border border-[#ddd2c4] bg-[#FFF6F9] p-5 h-full">
          <h2 className="border-b border-[#ded6ca] pb-3 text-[28px] font-medium text-[#4a3b33]">
            Product Details
          </h2>

          <div className="space-y-3 pt-4 text-[18px] leading-6 text-[#4c4742]">
            {product.category && product.category !== "N/A" && (
              <p>
                <span className="font-semibold text-[#303030]">Product Code :</span>{" "}
                {product.category}
              </p>
            )}
            {product.type && product.type !== "N/A" && (
              <p>
                <span className="font-semibold text-[#303030]">Type :</span> {product.type}
              </p>
            )}
            <p>
              <span className="font-semibold text-[#303030]">Color :</span> {selectedColor}
            </p>
            {product.material && product.material !== "Premium Material" && (
              <p>
                <span className="font-semibold text-[#303030]">Material :</span> {product.material}
              </p>
            )}
            {product.work && product.work !== "Standard" && (
              <p>
                <span className="font-semibold text-[#303030]">Work :</span> {product.work}
              </p>
            )}
            {product.packaging && product.packaging !== "Standard" && (
              <p>
                <span className="font-semibold text-[#303030]">Packaging :</span> {product.packaging}
              </p>
            )}
            {product.care && product.care !== "See label" && (
              <p>
                <span className="font-semibold text-[#303030]">Care :</span> {product.care}
              </p>
            )}
            {stock !== undefined && stock !== null && (
              <p>
                <span className="font-semibold text-[#303030]">Stock :</span>{" "}
                {stock > 0 ? `${stock} In Stock` : "Out of Stock"}
              </p>
            )}

            {product.description && (
              <p className="pt-2 text-[16px] leading-6 text-[#303030] border-t border-[#e6ddd2] mt-2">
                <span className="font-semibold text-[#303030]">Disclaimer :</span>{" "}
                {product.description}
              </p>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

