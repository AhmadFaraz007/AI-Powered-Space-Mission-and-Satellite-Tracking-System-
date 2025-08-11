import React from 'react';
import { motion } from 'framer-motion';

const realMissions = [
  {
    id: 1,
    name: 'Artemis I',
    description: 'Artemis I was the first uncrewed flight of NASA\'s Artemis program. It was the first integrated test of NASA\'s Orion spacecraft, Space Launch System (SLS) rocket, and ground systems at Kennedy Space Center.',
    image: '/images/artemis-i.jpg', // Placeholder image path
    link: 'https://www.nasa.gov/artemis-i', // Example link to NASA page
  },
  {
    id: 2,
    name: 'James Webb Space Telescope',
    description: 'The James Webb Space Telescope (JWST) is a space telescope jointly developed by NASA, ESA, and CSA. It is the largest optical telescope in space and the premier observatory of the next decade.',
    image: '/images/jwst.jpg', // Placeholder image path
    link: 'https://jwst.nasa.gov/', // Example link to NASA page
  },
  {
    id: 3,
    name: 'Mars Perseverance Rover',
    description: 'Perseverance is a car-sized Mars rover designed to explore the crater Jezero on Mars as part of NASA\'s Mars 2020 mission.',
    image: '/images/perseverance.jpg', // Placeholder image path
    link: 'https://mars.nasa.gov/mars2020/', // Example link to NASA page
  },
];

const RealNasaMissions = () => {
  return (
    <motion.section
      id="real-missions"
      className="py-20 bg-gradient-to-b from-[#232526] via-[#414345] to-[#232526] shadow-lg"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-8 text-center text-white"
        >
          Featured NASA Missions
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {realMissions.map(mission => (
            <motion.div
              key={mission.id}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-lg cursor-pointer"
              whileHover={{ scale: 1.03 }}
              onClick={() => window.open(mission.link, '_blank')}
            >
              <img
                src={mission.image}
                alt={mission.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold text-white mb-2">{mission.name}</h3>
                <p className="text-gray-300 text-sm">{mission.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default RealNasaMissions; 