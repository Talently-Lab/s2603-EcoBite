import HeroSection from "@/components/home/HeroSection";
import WhyEcoBite from "@/components/home/WhyEcoBite";
import ImpactCounter from "@/components/home/ImpactCounter";
import FeaturedRestaurants from "@/components/home/FeaturedRestaurants";
import HowItWorks from "@/components/home/HowItWorks";
export function HomePage() {
  return (
    <main>
      <HeroSection />
      <WhyEcoBite />
      <ImpactCounter />
      <FeaturedRestaurants />
      <HowItWorks />
    </main>
  );
}
