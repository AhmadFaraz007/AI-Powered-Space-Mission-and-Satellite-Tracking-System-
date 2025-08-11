import React, { useState } from 'react';

const faqs = [
  {
    question: 'What is the purpose of this dashboard?',
    answer: 'This dashboard provides real-time insights and management tools for space missions, satellites, and related data, inspired by NASA.'
  },
  {
    question: 'How is mission data updated?',
    answer: 'Mission data is updated automatically from the backend database and can be managed through the dashboard interface.'
  },
  {
    question: 'How can I launch a new mission?',
    answer: 'Click the "Launch Mission" button on the main page or use the Missions section to add and manage missions.'
  },
  {
    question: 'Who can access satellite tracking?',
    answer: 'Satellite tracking is available to all users for real-time visualization and monitoring.'
  },
  {
    question: 'Where does the data come from?',
    answer: 'Data is sourced from the backend API, which can be connected to real or simulated mission and satellite databases.'
  },
 
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-20 bg-gradient-to-b from-black/80 via-gray-900/80 to-black/90">
      <div className="max-w-3xl mx-auto px-4 glass-section">
        <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 via-purple-500 to-red-500 text-transparent bg-clip-text">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-gray-800/80 rounded-lg shadow-md">
              <button
                className="w-full flex justify-between items-center px-6 py-4 text-left text-lg font-medium text-blue-200 focus:outline-none"
                onClick={() => toggle(idx)}
                aria-expanded={openIndex === idx}
              >
                <span>{faq.question}</span>
                <span className={`ml-4 transform transition-transform duration-300 ${openIndex === idx ? 'rotate-45' : 'rotate-0'}`}>+</span>
              </button>
              <div
                className={`px-6 pb-4 text-gray-300 text-base transition-all duration-300 ease-in-out overflow-hidden ${openIndex === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                style={{}}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection; 