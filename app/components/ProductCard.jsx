import Image from "next/image";

export default function ProductCard({ product }) {
  return (
    <div className="border border-[#d9cfbf] bg-white p-3">
      <div className="relative aspect-[1.15/1] w-full overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="pt-3">
        <h3 className="text-[16px] font-medium leading-5 text-[#433730]">
          {product.title}
        </h3>

        <p className="mt-1 text-[11px] text-[#8c8177]">{product.description}</p>

        <p className="mt-2 text-[18px] font-medium text-[#2f2a28]">
          ₹ {product.price}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button className="bg-[#8a1d45] py-2 text-[11px] font-medium text-white">
            Buy Now
          </button>
          <button className="border border-[#d8cdbf] py-2 text-[11px] font-medium text-[#433730]">
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}