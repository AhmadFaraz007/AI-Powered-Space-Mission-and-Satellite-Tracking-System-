import React from 'react';
import { motion } from 'framer-motion';

const featuredDiscoveries = [
  {
    id: 1,
    title: 'James Webb Space Telescope Reveals Stunning New Views of Pillars of Creation',
    description: 'The iconic Pillars of Creation are seen in a new light, revealing hundreds of newborn stars in stunning detail.',
    image: '/images/jwst-pillars.jpg',
    link: '#' // Placeholder link
  },
  {
    id: 2,
    title: 'Perseverance Rover Uncovers Organic Molecules on Mars',
    description: 'NASA\'s Perseverance rover has found diverse organic molecules in Jezero Crater, offering new clues to ancient life on Mars.',
    image: '/images/p-mars.jpg',
    link: '#' // Placeholder link
  },
  {
    id: 3,
    title: 'Artemis I: Orion Completes Successful Lunar Flyby Mission',
    description: 'The uncrewed Orion spacecraft successfully orbited the Moon and returned to Earth, paving the way for future human missions.',
    image: '/images/artemis-orion.jpg',
    link: '#' // Placeholder link
  },
  {
    id: 4,
    title: 'Hubble Captures Grand Design Spiral Galaxy NGC 6814',
    description: 'The Hubble Space Telescope delivers a breathtaking image of a vibrant spiral galaxy, showcasing its intricate arms and bright core.',
    image: '/images/hubble-galaxy.jpg',
    link: '#' // Placeholder link
  }
];

const FeaturedDiscoveries = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-950 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-5xl font-extrabold mb-4 text-center leading-tight">
          Featured Discoveries
        </h2>
        <p className="text-center text-gray-300 mb-12 text-lg max-w-3xl mx-auto">
          Explore some of the most captivating insights and groundbreaking discoveries from NASA's ongoing missions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredDiscoveries.map((discovery) => (
            <motion.a
              key={discovery.id}
              href={discovery.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              whileHover={{ scale: 1.03, boxShadow: "0 15px 30px rgba(0,0,0,0.5)" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative rounded-xl overflow-hidden shadow-xl cursor-pointer block group h-96"
            >
              <img
                src={discovery.image}
                alt={discovery.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-6 z-10">
                <h3 className="text-xl font-bold mb-2 leading-tight group-hover:text-blue-300 transition-colors duration-300">
                  {discovery.title}
                </h3>
                <p className="text-gray-300 text-sm opacity-90 group-hover:opacity-100 transition-opacity duration-300">
                  {discovery.description}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDiscoveries;