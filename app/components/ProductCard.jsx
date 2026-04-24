import Image from "next/image";
import { useCurrency } from "../context/CurrencyContext";

export default function ProductCard({ product }) {
  const { formatPrice } = useCurrency();

  return (
    <div className="border border-[#d9cfbf] bg-white p-2.5 sm:p-4 cursor-pointer group rounded-sm shadow-sm h-full flex flex-col">
      <div className="relative aspect-[1/1] w-full overflow-hidden bg-gray-50 rounded-sm">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-contain p-1 transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="pt-2 sm:pt-4 flex flex-col flex-1">
        <h3 className="text-[14px] sm:text-[16px] font-medium leading-tight text-[#433730] group-hover:text-[#8a1d45] transition-colors line-clamp-1">
          {product.title}
        </h3>

        <p className="mt-0.5 text-[10px] sm:text-[11px] text-[#8c8177] line-clamp-1">{product.description}</p>

        <p className="mt-1 sm:mt-2 text-[15px] sm:text-[18px] font-bold text-[#7A1F3D]">
          {formatPrice(product.price, product.usdPrice)}
        </p>

        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-1.5 sm:gap-3 mt-auto">
          <button className="bg-[#7A1F3D] border border-[#7A1F3D] py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-white cursor-pointer hover:bg-white hover:text-[#7A1F3D] transition-all duration-300 active:scale-95">
            Buy Now
          </button>
          <button className="border border-[#7A1F3D] bg-white py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-[#7A1F3D] cursor-pointer hover:bg-[#7A1F3D] hover:text-white transition-all duration-300 active:scale-95">
            Add To Cart
          </button>
        </div>
      </div>
    </div>

  );
}