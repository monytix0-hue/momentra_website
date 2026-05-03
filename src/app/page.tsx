import Navbar from "./components/Navbar";
import Hero from "./sections/Hero";
import Problem from "./sections/Problem";
import WhatWeDo from "./sections/WhatWeDo";
import CoreConcept from "./sections/CoreConcept";
import SmartActions from "./sections/SmartActions";
import ProductModules from "./sections/ProductModules";
import WhyDifferent from "./sections/WhyDifferent";
import UseCases from "./sections/UseCases";
import CTASection from "./sections/CTASection";
import Footer from "./sections/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Problem />
      <WhatWeDo />
      <CoreConcept />
      <SmartActions />
      <ProductModules />
      <WhyDifferent />
      <UseCases />
      <CTASection />
      <Footer />
    </main>
  );
}
