import React from 'react';
import { Link } from 'react-router-dom';
import VideoBackground from '../components/VideoBackground';
import HeroSection from '../components/HeroSection';
import SatelliteTracking from '../components/SatelliteTracking';
import DatabaseTables from '../components/DatabaseTables';
import StarBackground from '../components/StarBackground';
import FAQSection from '../components/FAQSection';
import FeaturedDiscoveries from '../components/FeaturedDiscoveries';
import RealNasaMissions from '../components/RealNasaMissions';

const HomePage = () => {
  const sections = [
    {
      id: 'home',
      name: 'Home',
    },
    {
      id: 'missions',
      name: 'Missions',
    },
    {
      id: 'satellites',
      name: 'Satellites',
    },
    {
      id: 'database',
      name: 'Database',
    }
  ];

  return (
    <div className="min-h-screen text-white font-sans relative">
      {/* Hero Section with Video Background */}
      <section
        id="home"
        className="relative flex items-center justify-center shadow-lg min-h-screen h-screen"
      >
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
          <VideoBackground />
        </div>
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4">
          <HeroSection />
        </div>
      </section>

      {/* Star Background for all other sections */}
      <StarBackground exceptSectionId="home" />

      {/* 3D Satellite Tracking Section */}
      <section
        id="satellites"
        className="py-20 bg-gradient-to-b from-[#1e3c72] via-[#2a5298] to-[#232526] shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className="text-4xl font-bold mb-8 text-center"
          >
            Live Satellite Tracking
          </h2>
          <SatelliteTracking />
        </div>
      </section>

      {/* Database Tables Section */}
      <section
        id="database"
        className="py-20 bg-gray-900 text-white"
      >
        <DatabaseTables />
      </section>

      {/* Featured Discoveries Section */}
      <FeaturedDiscoveries />

      {/* NASA Featured Missions Section (Moved Below Featured Discoveries) */}
      <RealNasaMissions />

      {/* FAQ Section */}
      <section
        className="bg-gradient-to-b from-[#232526] via-[#232526] to-[#0f2027] shadow-lg"
      >
        <FAQSection />
      </section>
    </div>
  );
};

export default HomePage;