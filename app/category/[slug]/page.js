import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ProductCard from "../../components/ProductCard";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  let products = [];
  let categoryName = "Category";

  try {
    const res = await fetch(`https://shreedivyam.kdscrm.com/api/products/category/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) {
      if (res.status === 404) return notFound();
    }
    const data = await res.json();
    
    if (data && data.products) {
      const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";
      
      products = data.products.map(p => ({
        id: p.id,
        title: p.name,
        slug: p.slug,
        description: p.short_description || "Premium Dress",
        price: p.price,
        usdPrice: p.usd_price,
        image: p.image_path 
          ? (p.image_path.startsWith('http') ? p.image_path : `${IMAGE_BASE_URL}${p.image_path}`)
          : null,
      }));

      // Try to elegantly infer a proper title from the slug, or just use the slug name until we have categories API specifically fetched
      categoryName = slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    } else {
        return notFound();
    }
  } catch (error) {
    console.error("Failed to fetch category products:", error);
    return notFound();
  }

  return (
    <main className="bg-[#F8F6F3] min-h-screen flex flex-col text-[#2f2a28]">
      <Header />

      <section className="flex-1 mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24 py-10 sm:py-16">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <h1 className="text-[24px] sm:text-[32px] md:text-[40px] font-playfair text-[#303030] font-bold leading-tight">
            {categoryName}
          </h1>
          <p className="mt-3 text-gray-500 text-[14px] sm:text-[16px] max-w-[700px] mx-auto font-gt-walsheim italic">
            Explore our exclusive collection of premium handcrafted {categoryName}.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-16 sm:py-20 px-6 bg-white ring-1 ring-[#EFEAE4] rounded-sm">
            <p className="text-base sm:text-lg font-gt-walsheim">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 justify-items-center max-w-[1200px] mx-auto">
            {products.map((item) => (
              <Link href={`/product-details/${item.slug}`} key={item.id} className="block group">
                <div className="h-full transition-transform duration-300 hover:-translate-y-1.5 sm:hover:-translate-y-2">
                    <ProductCard product={item} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>


      <Footer />
    </main>
  );
}
