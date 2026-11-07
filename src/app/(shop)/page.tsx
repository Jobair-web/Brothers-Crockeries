import HeroCarousel from "@/components/home/HeroCarousel";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import FeaturedProductsSection from "@/components/home/FeaturedProductsSection";
import PopularProducts from "@/components/home/PopularProducts";
import TrustStrip from "@/components/home/TrustStrip";
import TipsSection from "@/components/home/TipsSection";
import CustomerReviews from "@/components/home/CustomerReviews";
import FaqSection from "@/components/home/FaqSection";

export default function HomePage() {
  return (
    <>
      <HeroCarousel />
      <FeaturedCategories />
      <FeaturedProductsSection />
      <PopularProducts />
      <TrustStrip />
      <TipsSection />
      <CustomerReviews />
      <FaqSection />
    </>
  );
}