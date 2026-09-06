'use client';

import { motion } from 'framer-motion';

export default function HeatExperience() {
  const experiences = [
    { text: 'MUSIC', img: '/media/DSC09522.jpg' },
    { text: 'FASHION', img: '/media/IMG_2064.jpg' },
    { text: 'PEOPLE', img: '/media/DSC04419.jpg' },
    { text: 'ENERGY', img: '/media/DSC01216.jpg' },
    { text: 'COMMUNITY', img: '/media/DSC09683.jpg' },
  ];

  return (
    <section className="py-24 bg-heat-black">
      <div className="container mx-auto px-6">
        <div className="flex flex-col space-y-12 md:space-y-0">
          {experiences.map((exp, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="group relative h-48 md:h-64 flex items-center overflow-hidden border-b border-heat-anthracite last:border-b-0 cursor-pointer"
            >
              {/* Background Image that reveals on hover */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-40 transition-opacity duration-700 scale-110 group-hover:scale-100"
                style={{ backgroundImage: `url(${exp.img})` }}
              />
              <div className="relative z-10 w-full flex justify-between items-center px-4 md:px-12">
                <h3 className="text-4xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-heat-chrome to-white group-hover:from-white group-hover:to-heat-red transition-all duration-500 tracking-wider">
                  {exp.text}
                </h3>
                <div className="hidden md:block w-12 h-12 rounded-full border border-heat-chrome flex items-center justify-center group-hover:bg-heat-red group-hover:border-heat-red transition-colors duration-500">
                  <span className="text-heat-chrome group-hover:text-white transition-colors duration-500 transform group-hover:translate-x-1">→</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
