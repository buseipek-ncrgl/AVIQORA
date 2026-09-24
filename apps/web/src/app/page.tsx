'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Hero } from '@/components/home/Hero';
import { QuickServicesBar } from '@/components/home/QuickServicesBar';
import { Destinations } from '@/components/home/Destinations';
import { FeaturedOffers } from '@/components/home/FeaturedOffers';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { RouteDirectory } from '@/components/home/RouteDirectory';
import { MobileAppSection } from '@/components/home/MobileAppSection';
import { FaqSection } from '@/components/home/FaqSection';
import { Newsletter } from '@/components/home/Newsletter';
import { Footer } from '@/components/Footer';
import { AuthModal } from '@/components/AuthModal';
import { PnrLookupModal } from '@/components/PnrLookupModal';
import { BoardingPassModal } from '@/components/BoardingPassModal';
import { FlightTrackerModal } from '@/components/FlightTrackerModal';
import { BaggageCalculatorModal } from '@/components/BaggageCalculatorModal';
import { BookingDto } from '@/types/api';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  // Modals state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPnrLookupOpen, setIsPnrLookupOpen] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isBaggageCalcOpen, setIsBaggageCalcOpen] = useState(false);
  const [activeBoardingPass, setActiveBoardingPass] = useState<BookingDto | null>(null);

  // Handle Flight Search Redirection to /flights
  const handleSearchFlight = (from?: string, to?: string, departure?: string, returnDate?: string, tripType?: string) => {
    let url = '/flights';
    const params: string[] = [];
    if (from) params.push(`from=${encodeURIComponent(from)}`);
    if (to) params.push(`to=${encodeURIComponent(to)}`);
    if (departure) params.push(`date=${encodeURIComponent(departure)}`);
    if (returnDate) params.push(`returnDate=${encodeURIComponent(returnDate)}`);
    if (tripType) params.push(`tripType=${encodeURIComponent(tripType)}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    router.push(url);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* 1. Header / Navbar */}
      <Header
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenPnrLookup={() => setIsPnrLookupOpen(true)}
        onSelectSearchRoute={(from, to) => handleSearchFlight(from, to, '')}
      />

      {/* 2. Hero Section & Flight Search Card */}
      <Hero
        onSearch={(from, to, date, returnDate, tripType) => handleSearchFlight(from, to, date, returnDate, tripType)}
        onPnrSearch={(pnr) => {
          api.bookings.getByPnr(pnr)
            .then((bkg) => setActiveBoardingPass(bkg))
            .catch(() => setIsPnrLookupOpen(true));
        }}
      />

      {/* 3. Quick Digital Services Bar (Bagaj Hesaplama, PNR Sorgula, Check-in, Canlı Radar) */}
      <QuickServicesBar
        onOpenBaggageCalc={() => setIsBaggageCalcOpen(true)}
        onOpenPnrLookup={() => setIsPnrLookupOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
      />

      {/* 4. Popular Destinations ("Popüler rotaları keşfet") */}
      <Destinations onSelectDestination={(from, to) => handleSearchFlight(from, to, '')} />

      {/* 5. Campaigns / Flight Deals ("Kaçırılmayacak fırsatlar") */}
      <FeaturedOffers onSelectOffer={(from, to) => handleSearchFlight(from, to, '')} />

      {/* 6. Why Choose Us ("Yolculuğunu kolaylaştırıyoruz") */}
      <WhyChooseUs />

      {/* 6. Trending Routes ("Popüler Uçuş Rotaları") */}
      <RouteDirectory onSelectRoute={(from, to) => handleSearchFlight(from, to, '')} />

      {/* 7. Mobile App Promotion ("Yolculuğun her anında yanında") */}
      <MobileAppSection />

      {/* 8. Sık Sorulan Sorular / FAQ Section */}
      <FaqSection />

      {/* 9. Newsletter ("Fırsatları kaçırma") */}
      <Newsletter />

      {/* 9. Footer */}
      <Footer />

      {/* 13. Global Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <PnrLookupModal
        isOpen={isPnrLookupOpen}
        onClose={() => setIsPnrLookupOpen(false)}
        onBookingFound={(booking) => setActiveBoardingPass(booking)}
      />

      <BoardingPassModal
        booking={activeBoardingPass}
        onClose={() => setActiveBoardingPass(null)}
      />

      <FlightTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
      />

      <BaggageCalculatorModal
        isOpen={isBaggageCalcOpen}
        onClose={() => setIsBaggageCalcOpen(false)}
        onOpenPnrLookup={() => setIsPnrLookupOpen(true)}
      />
    </div>
  );
}

