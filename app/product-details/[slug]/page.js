import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StayInTouch from "../../components/StayInTouch";
import ProductCard from "../../components/ProductCard";
import ProductGallery from "../../components/ProductGallery";
import ProductInfo from "../../components/ProductInfo";
import { products } from "../../data/products";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    notFound();
  }

  // Use some of the other products as related products
  const relatedProducts = products.filter((p) => p.id !== product.id).slice(0, 3);

  return (
    <main className="bg-[#FFFFFF] text-[#2f2a28]">
      <Header />

      <section className="mx-auto max-w-[1220px] h-auto min-h-[800px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 grid-cols-1 lg:grid-cols-[1.05fr_1fr_0.95fr]">
          <ProductInfo product={product} />
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
                  <span className="font-semibold text-[#6f5a4d]">Color :</span> {product.color}
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
      </section>

      <section className="bg-[#efe6d6] py-12">
        <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-[34px] font-medium text-[#4a3b33]">
            People Also Bought
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>

      <StayInTouch />
      <Footer />
    </main>
  );
}
