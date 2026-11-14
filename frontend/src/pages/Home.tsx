import HeroSection from "@/components/home/HeroSection";
import WhyEcoBite from "@/components/home/WhyEcoBite";
import FeaturedRestaurants from "@/components/home/FeaturedRestaurants";
import HowItWorks from "@/components/home/HowItWorks";
export function HomePage() {
  return (
    <main>
      <HeroSection />
      <WhyEcoBite />
      <FeaturedRestaurants />
      <HowItWorks />
    </main>
  );
}
