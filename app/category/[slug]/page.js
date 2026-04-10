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

      <section className="flex-1 mx-auto w-full max-w-[1220px] px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-[40px] font-playfair text-[#7A1F3D] font-bold">
            {categoryName}
          </h1>
          <p className="mt-4 text-[#4c4742] text-sm md:text-base">Explore our exclusive collections for {categoryName}</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No products found in this category.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((item) => (
              <Link href={`/product-details/${item.slug}`} key={item.id} className="block group">
                <div className="transition-transform duration-300 group-hover:-translate-y-2">
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
