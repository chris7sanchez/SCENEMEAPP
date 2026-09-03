import { HeroSection } from '@/components/landing/hero-section';
import { StatsCounter } from '@/components/landing/stats-counter';
import { ServicesGrid } from '@/components/landing/services-grid';
import { AiRehearsalPreview } from '@/components/landing/ai-rehearsal-preview';
import { PacktorProSection } from '@/components/landing/packtor-pro-section';
import { PortfolioGallery } from '@/components/landing/portfolio-gallery';
import { FaqSection } from '@/components/landing/faq-section';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function LandingPage() {
  return (
    <>
      
      <main className="min-h-screen bg-black text-white selection:bg-white/20 selection:text-white">
        
        {/* JSON-LD Schema.org Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "SCENE ME",
              "image": "https://www.scenemeapp.com/apple-touch-icon.png",
              "description": "Estudio para actores en Madrid. Videobooks 4K, Self-Tapes y ensayo de escenas con Inteligencia Artificial.",
              "url": "https://www.scenemeapp.com",
              "telephone": "",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Madrid",
                "addressCountry": "ES"
              },
              "priceRange": "$$"
            })
          }}
        />

        <HeroSection />
        
        {/* Optional smoothing layer */}
        <div className="relative z-10 bg-black">
          <StatsCounter />
          <ServicesGrid />
          <AiRehearsalPreview />
          <PacktorProSection />
          <PortfolioGallery />
          <FaqSection />
          <LandingFooter />
        </div>
      </main>
    </>
  );
}
