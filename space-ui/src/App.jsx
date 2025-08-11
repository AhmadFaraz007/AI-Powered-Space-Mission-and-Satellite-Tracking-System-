import React from 'react';
import { Routes, Route } from 'react-router-dom';
// Removed motion import as it will be handled within individual components
// import { motion } from 'framer-motion';
// import VideoBackground from './components/VideoBackground'; // Moved to HomePage if needed
import Navbar from './components/Navbar';
// Removed section imports as they will be part of HomePage
// import HeroSection from './components/HeroSection';
// import SatelliteTracking from './components/SatelliteTracking';
// import DatabaseTables from './components/DatabaseTables';
// import StarBackground from './components/StarBackground'; // Moved to HomePage or specific sections
// import Missions from './pages/missions';
// import FAQSection from './components/FAQSection';

// Import new components
import HomePage from './pages/HomePage';
import MissionsManage from './pages/MissionsManage';
import SatellitesManage from './pages/SatellitesManage';
import TrackingManage from './pages/TrackingManage';
import GroundStationsManage from './pages/GroundStationsManage';
import SpaceDebrisManage from './pages/SpaceDebrisManage';
import PredictionsManage from './pages/PredictionsManage';
import SystemLogsManage from './pages/SystemLogsManage';
import SatelliteTrackingManage from './pages/SatelliteTrackingManage';

const App = () => {
  // Sections array might need to be moved or adjusted depending on Navbar usage
  const sections = [
    {
      id: 'home',
      name: 'Home',
      path: '/',
    },
    {
      id: 'missions',
      name: 'Missions',
      path: '/missions',
    },
    {
      id: 'satellites',
      name: 'Satellites',
      path: '/satellites',
    },
    {
      id: 'tracking',
      name: 'Tracking',
      path: '/tracking',
    },
    {
      id: 'ground-stations',
      name: 'Ground Stations',
      path: '/ground-stations',
    },
    {
      id: 'space-debris',
      name: 'Space Debris',
      path: '/space-debris',
    },
    {
      id: 'predictions',
      name: 'Predictions',
      path: '/predictions',
    },
    {
      id: 'system-logs',
      name: 'System Logs',
      path: '/system-logs',
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-blue-950">
      {/* Navbar will be outside Routes so it appears on all pages */}
      <Navbar sections={sections} />

      {/* Main content area where routed components will render */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Routes for individual table management pages */}
          <Route path="/missions" element={<MissionsManage />} />
          <Route path="/satellites" element={<SatellitesManage />} />
          <Route path="/tracking" element={<SatelliteTrackingManage />} />
          <Route path="/ground-stations" element={<GroundStationsManage />} />
          <Route path="/space-debris" element={<SpaceDebrisManage />} />
          <Route path="/predictions" element={<PredictionsManage />} />
          <Route path="/system-logs" element={<SystemLogsManage />} />
          {/* Add more routes for other sections if needed as separate pages */}

          {/* Optional: Add a No Match route for 404 */}
          {/* <Route path="*" element={<NoMatch />} /> */}
        </Routes>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-black/80 backdrop-blur-md py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">NASA</h4>
              <p className="text-gray-400">
                Real-time tracking and AI-powered insights for space missions
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={section.path}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {section.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  GitHub
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500">
            <p>© 2024 NASA. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;