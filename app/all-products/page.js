import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function AllProductsPage({ searchParams }) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const itemsPerPage = 6;

  let allProducts = [];

  try {
    const res = await fetch(`https://shreedivyam.kdscrm.com/api/products`, { next: { revalidate: 60 } });
    if (!res.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await res.json();

    const rawProducts = data.products || data.data || (Array.isArray(data) ? data : []);

    if (rawProducts && Array.isArray(rawProducts)) {
      const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

      allProducts = rawProducts.map(p => ({
        id: p.id,
        title: p.name || p.title,
        slug: p.slug,
        description: p.short_description || p.description || "Premium Dress",
        price: p.price,
        usdPrice: p.usd_price,
        image: p.image_path
          ? (p.image_path.startsWith('http') ? p.image_path : `${IMAGE_BASE_URL}${p.image_path}`)
          : null,
      }));
    }
  } catch (error) {
    console.error("Failed to fetch all products:", error);
  }

  // Pagination Logic
  const totalItems = allProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = allProducts.slice(startIndex, endIndex);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) pages.push(i);
    }
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <main className="bg-[#F8F6F3] min-h-screen flex flex-col text-[#2f2a28]">
      <Header />

      <section className="flex-1 mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24 py-10 sm:py-16">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <h1 className="text-[24px] sm:text-[32px] md:text-[40px] font-playfair text-[#303030] font-bold leading-tight">
            Our Entire Collection
          </h1>
          <p className="mt-3 text-gray-500 text-[14px] sm:text-[16px] max-w-[700px] mx-auto font-gt-walsheim italic">
            Handcrafted devotion in every stitch. Explore our complete range of premium dresses
          </p>
        </div>

        {allProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-16 sm:py-20 px-6 bg-white ring-1 ring-[#EFEAE4] rounded-sm">
            <p className="text-base sm:text-lg font-gt-walsheim">No products found at the moment. Please check back later.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center">
              {currentProducts.map((item) => (
                <Link href={`/product-details/${item.slug}`} key={item.id} className="block group w-full">
                  <div className="h-full transition-transform duration-300 hover:-translate-y-1.5 sm:hover:-translate-y-2">
                    <ProductCard product={item} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                  <Link
                    href={currentPage > 1 ? `/all-products?page=${currentPage - 1}` : "#"}
                    className={`p-2 rounded-full border transition-all ${currentPage > 1 ? "border-[#7A1F3D] text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}
                  >
                    <ChevronLeft size={20} />
                  </Link>

                  <div className="flex items-center gap-1">
                    {pageNumbers.map((num) => (
                      <Link
                        key={num}
                        href={`/all-products?page=${num}`}
                        className={`w-10 h-10 flex items-center justify-center rounded-sm text-[14px] font-bold transition-all ${currentPage === num ? "bg-[#7A1F3D] text-white" : "text-gray-500 hover:bg-[#FDF8F3] hover:text-[#7A1F3D] border border-transparent hover:border-[#E8DDD4]"}`}
                      >
                        {num}
                      </Link>
                    ))}
                  </div>

                  <Link
                    href={currentPage < totalPages ? `/all-products?page=${currentPage + 1}` : "#"}
                    className={`p-2 rounded-full border transition-all ${currentPage < totalPages ? "border-[#7A1F3D] text-[#7A1F3D] hover:bg-[#7A1F3D] hover:text-white" : "border-gray-200 text-gray-300 cursor-not-allowed"}`}
                  >
                    <ChevronRight size={20} />
                  </Link>
                </div>

                <span className="text-[13px] text-gray-400 font-medium uppercase tracking-widest">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
