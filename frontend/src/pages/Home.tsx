import HeroSection from "@/components/home/HeroSection";
import WhyEcoBite from "@/components/home/WhyEcoBite";
import ImpactCounter from "@/components/home/ImpactCounter";
import FeaturedRestaurants from "@/components/home/FeaturedRestaurants";
import HowItWorks from "@/components/home/HowItWorks";
export function HomePage() {
  //  (Mock Data)
const MOCK_ECO_DATA = {
  co2Value: "0.000",
  co2Unit: "kg CO₂",
  pedidosTotales: 0,
};

  return (
    <main>
      <HeroSection />
      <WhyEcoBite />
      <ImpactCounter 
        titleText="Contador global de CO₂ ahorrado"
        value={MOCK_ECO_DATA.co2Value}
        unit={MOCK_ECO_DATA.co2Unit}
        footerText={`Conteo comunitario: ${MOCK_ECO_DATA.pedidosTotales} pedidos EcoBite`}
      />
      <FeaturedRestaurants />
      <HowItWorks />
    </main>
  );
}
