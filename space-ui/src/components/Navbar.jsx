import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ sections }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      // Update navbar background on scroll
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 font-extrabold text-3xl md:text-4xl tracking-widest drop-shadow-lg animate-nasa-logo"
                style={{
                  textShadow: '0 0 10px rgba(255,255,255,0.3)',
                  backgroundSize: '200% auto',
                  animation: 'gradient 3s ease infinite'
                }}
              >
                NASA
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            {sections.map((section) => (
              <div
                key={section.id}
              >
                <Link
                  to={section.path}
                  className={`relative text-sm font-medium transition-colors ${
                    location.pathname === section.path
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {section.name}
                  {location.pathname === section.path && (
                    <div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-nasa-red transition-all duration-500"
                    />
                  )}
                </Link>
              </div>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-400 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
