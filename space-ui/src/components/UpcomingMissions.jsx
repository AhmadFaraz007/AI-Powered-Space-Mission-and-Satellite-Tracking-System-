import React from 'react';
import { motion } from 'framer-motion';

const upcomingMissions = [
  {
    id: 1,
    name: 'Europa Clipper',
    description: 'NASA\'s Europa Clipper will conduct a detailed reconnaissance of Jupiter\'s moon Europa to investigate whether the icy moon could harbor conditions suitable for life.',
    image: '/images/europa-clipper.jpg', // Placeholder image path
    launchDate: 'October 2024',
    link: 'https://europa.nasa.gov/',
  },
  {
    id: 2,
    name: 'Mars Sample Return',
    description: 'This ambitious campaign, in partnership with ESA, will retrieve samples of Martian rock and soil collected by the Perseverance rover and return them to Earth for detailed study.',
    image: '/images/mars-sample-return.jpg', // Placeholder image path
    launchDate: 'Starting 2027',
    link: 'https://mars.nasa.gov/msr/',
  },
  {
    id: 3,
    name: 'Dragonfly',
    description: 'Dragonfly is a NASA rotorcraft-lander mission to Titan, the largest moon of Saturn. It will explore diverse environments on Titan to study prebiotic chemistry and habitability.',
    image: '/images/dragonfly.jpg', // Placeholder image path
    launchDate: 'July 2028',
    link: 'https://dragonfly.jhuapl.edu/',
  },
];

const UpcomingMissions = () => {
  return (
    <motion.section
      id="upcoming-missions"
      className="py-16 bg-gray-800/80 rounded-lg p-6 backdrop-blur-sm"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Upcoming NASA Missions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {upcomingMissions.map(mission => (
            <motion.div
              key={mission.id}
              className="bg-gray-700 rounded-lg overflow-hidden shadow-lg cursor-pointer border border-gray-600"
              whileHover={{ scale: 1.02 }}
              onClick={() => window.open(mission.link, '_blank')}
            >
              <img
                src={mission.image}
                alt={mission.name}
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-white mb-2">{mission.name}</h3>
                <p className="text-gray-300 text-sm mb-3">Launch: {mission.launchDate}</p>
                <p className="text-gray-400 text-sm">{mission.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default UpcomingMissions; 