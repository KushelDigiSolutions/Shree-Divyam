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
    const res = await fetch(`/api/proxy/products/category/${slug}`, { next: { revalidate: 60 } });
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
        image: `${IMAGE_BASE_URL}${p.image_path}`,
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
    <main className="bg-[#FFFFFF] min-h-screen flex flex-col text-[#2f2a28]">
      <Header />

      <section className="flex-1 mx-auto w-full max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24 py-10 sm:py-16">
        <div className="text-center mb-10 sm:mb-14 lg:mb-16">
          <h1 className="text-[24px] sm:text-[36px] md:text-[45px] font-playfair text-[#7A1F3D] font-bold leading-tight">
            {categoryName}
          </h1>
          <p className="mt-2.5 sm:mt-3 text-gray-600 text-[13px] sm:text-[16px] max-w-[600px] mx-auto leading-relaxed">
            Explore our exclusive collections of premium handcrafted dresses for {categoryName}.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-16 sm:py-20 px-6 bg-gray-50 rounded-sm">
            <p className="text-base sm:text-lg font-gt-walsheim">No products found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
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
