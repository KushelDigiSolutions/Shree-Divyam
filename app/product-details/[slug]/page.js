import Header from "../../components/Header";
import Footer from "../../components/Footer";
import StayInTouch from "../../components/StayInTouch";
import ProductCard from "../../components/ProductCard";
import ProductContainer from "../../components/ProductContainer";
import ProductInfo from "../../components/ProductInfo";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params;

  let productFromApi = null;
  let relatedProductsApi = [];

  try {
    // Direct API call for product details - bypass proxy for this specific endpoint
    const res = await fetch(`https://shreedivyam.kdscrm.com/api/products/${slug}`, { 
      next: { revalidate: 60 },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Product API returned status: ${res.status}`);
      throw new Error(`API returned ${res.status}`);
    }
    
    const data = await res.json();
    if (data && data.product) {
      productFromApi = { 
        ...data.product,
        // Override with root-level fields if they exist (specific to some API structures)
        price: data.price || data.product.price,
        images: data.images || data.product.images,
        variations: data.variants || data.product.variations || data.product.variants,
        usd_price: data.usd_price || data.product.usd_price
      };
    } else {
      console.error("Product API response missing product data:", data);
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
    id: productFromApi.id || productFromApi.product_id || productFromApi.id_product,
    title: productFromApi.name || productFromApi.product_name || "Premium Dress",
    price: productFromApi.price,
    usdPrice: productFromApi.usd_price,
    basePrice: Number(productFromApi.price) || 0,
    currency: productFromApi.currency || '₹',
    variations: productFromApi.variations || [],
    description: (productFromApi.short_description || productFromApi.description || productFromApi.product_specification || "")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim(),
    fullDescription: (productFromApi.product_detail || productFromApi.description || "")
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')
      || productFromApi.product_specification,
    category: productFromApi.sku_name || productFromApi.category?.name || "N/A",
    type: productFromApi.sub_category?.name || "N/A",
    color: productFromApi.variations?.[0]?.color || "N/A",
    material: "Premium Material", // Fallback, no direct field mapping
    work: "Standard",
    packaging: "Standard",
    care: "See label",
    images: (() => {
      let imgs = [];
      if (productFromApi.image_path) imgs.push(productFromApi.image_path);

      let additionalImgs = productFromApi.images;
      if (typeof additionalImgs === 'string') {
        try {
          // Check if it's a JSON stringified array
          if (additionalImgs.startsWith('[') && additionalImgs.endsWith(']')) {
            additionalImgs = JSON.parse(additionalImgs);
          } else {
            // Otherwise treat as a single string
            additionalImgs = [additionalImgs];
          }
        } catch (e) {
          additionalImgs = [additionalImgs];
        }
      }

      if (Array.isArray(additionalImgs)) {
        imgs = [...imgs, ...additionalImgs];
      }

      // Deduplicate and filter out empty strings
      imgs = [...new Set(imgs.filter(img => img && typeof img === 'string'))];

      return imgs.map(img => img.startsWith('http') ? img : `${IMAGE_BASE_URL}${img}`);
    })(),
    // Fallback if no images are found at all
    ...((!productFromApi.image_path && (!productFromApi.images || productFromApi.images.length === 0)) ? {
      images: ["https://placehold.co/800x800?text=No+Image+Available"]
    } : {}),
    sizes: (() => {
      const s = productFromApi.options?.sizes || productFromApi.variations?.map(v => v.size).filter((value, index, self) => self.indexOf(value) === index) || [];
      return s.length > 0 ? s : ["Free Size"];
    })(),
    colors: (() => {
      const c = productFromApi.options?.colors || productFromApi.variations?.map(v => v.color).filter((value, index, self) => self.indexOf(value) === index) || [];
      return c.length > 0 ? c : ["#303030"];
    })(),
    slug: productFromApi.slug,
  };

  const relatedProducts = relatedProductsApi.map(p => ({
    id: p.id,
    title: p.name,
    description: p.short_description || "Premium Dress",
    price: p.price,
    usdPrice: p.usd_price,
    image: `${IMAGE_BASE_URL}${p.image_path}`,
  }));

  return (
    <main className="bg-[#FFFFFF] text-[#2f2a28]">
      <Header />

      <section className="mx-auto max-w-[1440px] h-auto min-h-[400px] px-6 sm:px-10 md:px-16 lg:px-24 py-6 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px] sm:text-[14px] text-[#8C8C8C] mb-8 font-gt-walsheim overflow-hidden">
          <Link href="/" className="hover:text-[#7A1F3D] transition-colors cursor-pointer shrink-0">Home</Link>
          <span className="shrink-0">/</span>
          <span className="text-[#303030] font-medium truncate">{product.title}</span>
        </div>
        
        <ProductContainer product={product} />
      </section>

      {relatedProducts.length > 0 && (
        <section className="bg-[#efe6d6] py-12 md:py-16">
          <div className="mx-auto max-w-[1440px] px-6 sm:px-10 md:px-16 lg:px-24">
            <h2 className="mb-10 text-center text-[28px] sm:text-[34px] font-playfair font-medium text-[#4a3b33]">
              People Also Bought
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
