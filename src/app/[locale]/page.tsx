import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import AboutHeat from '@/components/home/AboutHeat';
import HeatExperience from '@/components/home/HeatExperience';
import GalleryPreview from '@/components/home/GalleryPreview';
import CommunitySignup from '@/components/home/CommunitySignup';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import FitsTeaser from '@/components/home/FitsTeaser';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-heat-black">
      <Hero />
      <Marquee />
      <UpcomingEvents />
      <FitsTeaser />
      <AboutHeat />
      <HeatExperience />
      <GalleryPreview />
      <CommunitySignup />
    </main>
  );
}
