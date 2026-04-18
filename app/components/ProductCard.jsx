import Image from "next/image";
import { useCurrency } from "../context/CurrencyContext";

export default function ProductCard({ product }) {
  const { formatPrice } = useCurrency();

  return (
    <div className="border border-[#d9cfbf] bg-white p-3 sm:p-4 cursor-pointer group rounded-sm shadow-sm">
      <div className="relative aspect-[1.15/1] w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="pt-3 sm:pt-4">
        <h3 className="text-[15px] sm:text-[16px] font-medium leading-tight text-[#433730] group-hover:text-[#8a1d45] transition-colors line-clamp-1">
          {product.title}
        </h3>

        <p className="mt-1 text-[10px] sm:text-[11px] text-[#8c8177] line-clamp-1">{product.description}</p>

        <p className="mt-2 text-[16px] sm:text-[18px] font-bold text-[#2f2a28]">
          {formatPrice(product.price, product.usdPrice)}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
          <button className="bg-[#7A1F3D] border border-[#7A1F3D] py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-medium text-white cursor-pointer hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 active:scale-95">
            Buy Now
          </button>
          <button className="border border-[#7A1F3D] bg-white py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-medium text-[#7A1F3D] cursor-pointer hover:bg-[#7A1F3D] hover:text-white transition-all duration-300 active:scale-95">
            Add To Cart
          </button>
        </div>
      </div>
    </div>

  );
}