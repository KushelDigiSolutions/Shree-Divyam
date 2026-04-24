import Header from "./components/Header";
import Hero from "./components/Hero";
import PromoSection from "./components/PromoSection";
import Collections from "./components/Collections";
import LatestCollection from "./components/LatestCollection";
import ProductGrid from "./components/ProductGrid";
import DivinitySection from "./components/DivinitySection";
import LadduGopalDresses from "./components/LadduGopalDresses";
import SacredCraft from "./components/SacredCraft";
import MataRaniDresses from "./components/MataRaniDresses";
import GiftSection from "./components/GiftSection";
import FeedbackSection from "./components/FeedbackSection";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";

export default function Home() {

  return (
    <main>
      <Header />
      <Hero />
      <PromoSection />
      <Collections />
      <LatestCollection />
      <ProductGrid />
      <DivinitySection />
      <LadduGopalDresses />
      <SacredCraft />
      <MataRaniDresses />
      <GiftSection />
      <FeedbackSection />
      <FaqSection />
      <Footer />
    </main>
  );
}