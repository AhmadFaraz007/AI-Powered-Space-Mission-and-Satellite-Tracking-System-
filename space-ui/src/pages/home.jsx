// src/pages/home.jsx
import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Missions',
    description: 'Explore historical and ongoing space missions powered by AI insights.',
    image: '/assets/missions.jpg',
  },
  {
    title: 'Satellites',
    description: 'Track real-time satellite data and monitor their orbits dynamically.',
    image: '/assets/satellites.jpg',
  },
  {
    title: 'Space Debris',
    description: 'Visualize space debris and predict potential hazards with AI models.',
    image: '/assets/debris.jpg',
  },
  {
    title: 'Predictions',
    description: 'See AI-powered forecasts on satellite behavior and space conditions.',
    image: '/assets/predictions.jpg',
  },
];

const Home = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 text-white">
        🌌 AI-Powered Space Mission & Satellite Tracking Dashboard
      </h1>

      <div className="grid gap-10 md:grid-cols-2">
        {features.map((item, idx) => (
          <motion.div
            key={idx}
            className="rounded-2xl overflow-hidden bg-slate-800 shadow-xl hover:shadow-2xl transition-shadow duration-300"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.2 }}
          >
            <img src={item.image} alt={item.title} className="w-full h-60 object-cover" />
            <div className="p-6">
              <h2 className="text-2xl font-semibold text-white mb-2">{item.title}</h2>
              <p className="text-slate-300 text-sm">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
