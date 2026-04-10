import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StayInTouch from "../../components/StayInTouch";
import ProductCard from "../../components/ProductCard";
import ProductContainer from "../../components/ProductContainer";
import ProductInfo from "../../components/ProductInfo";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;

  let productFromApi = null;
  let relatedProductsApi = [];

  try {
    const res = await fetch(`https://shreedivyam.kdscrm.com/api/products/${slug}`, { next: { revalidate: 60 } });
    const data = await res.json();
    if (data && data.product) {
      productFromApi = data.product;
    }
  } catch (error) {
    console.error("Failed to fetch product:", error);
  }

  if (!productFromApi) {
    notFound();
  }

  // Fetch category products for 'People Also Bought' / related items
  if (productFromApi.category?.slug) {
    try {
      const relatedRes = await fetch(`https://shreedivyam.kdscrm.com/api/products/category/${productFromApi.category.slug}`, { next: { revalidate: 60 } });
      const relatedData = await relatedRes.json();
      if (relatedData && relatedData.products) {
        relatedProductsApi = relatedData.products.filter(p => p.id !== productFromApi.id).slice(0, 3);
      }
    } catch (e) {
      console.error("Failed to fetch related products:", e);
    }
  }

  const IMAGE_BASE_URL = "https://shreedivyam.kdscrm.com/uploads/";

  // Map API fields to our expected layout structure
  const product = {
    id: productFromApi.id,
    title: productFromApi.product_name,
    price: `${productFromApi.currency || '₹'} ${productFromApi.price}`,
    basePrice: Number(productFromApi.price) || 0,
    currency: productFromApi.currency || '₹',
    variations: productFromApi.variations || [],
    description: productFromApi.short_description || productFromApi.product_specification,
    fullDescription: (productFromApi.product_detail || "")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ') 
      || productFromApi.product_specification,
    category: productFromApi.sku_name || productFromApi.category?.name || "N/A",
    type: productFromApi.sub_category?.name || "N/A",
    color: productFromApi.variations?.[0]?.color || "N/A",
    material: "Premium Material", // Fallback, no direct field mapping
    work: "Standard",
    packaging: "Standard",
    care: "See label",
    images: productFromApi.images && productFromApi.images.length > 0 
            ? productFromApi.images.map(img => `${IMAGE_BASE_URL}${img}`)
            : ["https://placehold.co/800x800?text=No+Image+Available"],
    sizes: productFromApi.variations?.map(v => v.size).filter((value, index, self) => self.indexOf(value) === index) || ["Free Size"],
    // Colors mapped from variation but parsed into hex if possible later (falling back to plain string for now)
    colors: productFromApi.variations?.map(v => v.color).filter((value, index, self) => self.indexOf(value) === index) || ["#303030"],
  };

  const relatedProducts = relatedProductsApi.map(p => ({
    id: p.id,
    title: p.name,
    description: p.short_description || "Premium Dress",
    price: p.price,
    image: `${IMAGE_BASE_URL}${p.image_path}`,
  }));

  return (
    <main className="bg-[#FFFFFF] text-[#2f2a28]">
      <Header />

      <section className="mx-auto max-w-[1220px] h-auto min-h-[800px] px-4 py-8 sm:px-6 lg:px-8">
        <ProductContainer product={product} />
      </section>

      {relatedProducts.length > 0 && (
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
      )}

      <StayInTouch />
      <Footer />
    </main>
  );
}
