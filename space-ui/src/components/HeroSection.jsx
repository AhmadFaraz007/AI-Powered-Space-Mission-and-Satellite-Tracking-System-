import React, { useState, useEffect } from 'react';
// Removed motion import
// import { motion } from 'framer-motion';
// Removed useNavigate as navigation buttons are removed
// import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
    }, 10000); // 10 seconds delay as requested

    return () => clearTimeout(timer);
  }, []);

  // Removed navigate and handleNavigation as navigation buttons are removed
  // const navigate = useNavigate();

  // const handleNavigation = (path) => {
  //   navigate(path);
  // };

  return (
    <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-4">
      {/* Main Title and Tagline centered, with delayed fade-in */}
      <div
        className={`transition-opacity duration-1000 ease-in ${showText ? 'opacity-100' : 'opacity-0'}`}
      >
        <h1
          className="text-4xl md:text-7xl font-extrabold text-white drop-shadow-lg tracking-tight leading-tight"
        >
          Space Mission Control
        </h1>
        <p
          className="mt-4 text-lg md:text-2xl text-blue-200 font-medium italic max-w-3xl"
        >
          "Empowering humanity's journey beyond the stars."
        </p>
      </div>

      {/* Removed all other content: buttons, stats cards, and vignette overlays */}

    </div>
  );
};

export default HeroSection; 