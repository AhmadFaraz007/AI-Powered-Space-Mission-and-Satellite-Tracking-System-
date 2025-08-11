import React from 'react';
import { motion } from 'framer-motion';

const MissionCard = ({ mission }) => {
  const getImageSrc = (missionName) => {
    const imageName = missionName.toLowerCase().replace(/ /g, '-');
    return `/images/${imageName}.png`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-transform duration-300 ease-in-out"
    >
      <img
        src={getImageSrc(mission.name)}
        alt={`${mission.name} image`}
        className="w-full h-40 object-cover"
      />

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 flex-grow">{mission.name}</h3>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-auto w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Manage
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MissionCard; 