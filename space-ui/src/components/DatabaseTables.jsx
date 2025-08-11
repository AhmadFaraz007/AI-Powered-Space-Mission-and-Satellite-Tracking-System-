import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DatabaseTables = () => {
  const navigate = useNavigate();

  const tables = [
    {
      id: 'missions',
      name: 'Missions',
      description: 'Manage space missions and their details',
      icon: '🚀',
      color: 'from-blue-500 to-purple-600'
    },
    {
      id: 'satellites',
      name: 'Satellites',
      description: 'Track and manage satellite information',
      icon: '🛰️',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'tracking',
      name: 'Satellite Tracking',
      description: 'Monitor satellite positions and trajectories',
      icon: '📡',
      color: 'from-pink-500 to-red-600'
    },
    {
      id: 'ground-stations',
      name: 'Ground Stations',
      description: 'Manage ground station facilities',
      icon: '🏢',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'space-debris',
      name: 'Space Debris',
      description: 'Identify and track orbital debris for safer operations',
      icon: '💫',
      color: 'from-orange-500 to-yellow-600'
    },
    {
      id: 'predictions',
      name: 'Predictions',
      description: 'AI-driven insights for future events',
      icon: '🔮',
      color: 'from-yellow-500 to-green-600'
    },
    {
      id: 'system-logs',
      name: 'System Logs',
      description: 'Monitor system health and activity',
      icon: '📊',
      color: 'from-green-500 to-teal-600'
    }
  ];

  const getImageSrc = (tableId) => {
    if (tableId === 'tracking') {
      return '/images/satellites-tracking.png';
    }
    return `/images/${tableId}.png`;
  };

  return (
    <section className="py-20 bg-white text-black">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-8 text-left text-black"
        >
          More Topics from NASA
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <motion.div
              key={table.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03 }}
              className="relative rounded-xl shadow-lg overflow-hidden flex flex-col h-full transition-transform duration-300 ease-in-out cursor-pointer bg-gray-800"
              onClick={() => navigate(`/${table.id}`)}
            >
              <img
                src={getImageSrc(table.id)}
                alt={`${table.name} image`}
                className="w-full h-72 object-cover"
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src='/placeholder.png';
                    console.error(`Failed to load image for ${table.name}: ${getImageSrc(table.id)}`);
                }}
              />
              {/* Overlay for Title and Arrow with white text and strong gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4 text-white">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold">{table.name}</h3>
                  {/* Red Arrow Icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                  </svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DatabaseTables; 