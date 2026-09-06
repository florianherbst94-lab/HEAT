'use client';

import { motion } from 'framer-motion';

export default function GalleryPage() {
  const images = [
    { src: '/media/DSC04419.jpg', alt: 'Heat Event 1', aspect: 'aspect-square' },
    { src: '/media/DSC05031.jpg', alt: 'Heat Event 2', aspect: 'aspect-[3/4]' },
    { src: '/media/DSC05191.jpg', alt: 'Heat Event 3', aspect: 'aspect-video' },
    { src: '/media/DSC05215.jpg', alt: 'Heat Event 4', aspect: 'aspect-[4/3]' },
    { src: '/media/DSC05256.jpg', alt: 'Heat Event 5', aspect: 'aspect-square' },
    { src: '/media/DSC05408.jpg', alt: 'Heat Event 6', aspect: 'aspect-[3/4]' },
    { src: '/media/DSC04419.jpg', alt: 'Heat Event 7', aspect: 'aspect-video' }, // Reusing as placeholder
    { src: '/media/DSC05031.jpg', alt: 'Heat Event 8', aspect: 'aspect-square' }, // Reusing as placeholder
  ];

  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      {/* Header */}
      <section className="px-6 mb-16 text-center">
        <div className="container mx-auto max-w-6xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-display text-5xl md:text-7xl font-bold tracking-widest text-white uppercase mb-4"
          >
            Gallery
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-heat-chrome text-lg max-w-2xl mx-auto"
          >
            The energy, the looks, the moments.
          </motion.p>
        </div>
      </section>

      {/* Masonry Grid Placeholder */}
      <section className="px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
            {images.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i % 3 * 0.1 }}
                className={`relative group overflow-hidden bg-heat-anthracite ${
                  i === 1 ? 'row-span-2' : 
                  i === 2 ? 'col-span-1 md:col-span-2' : 
                  i === 5 ? 'row-span-2' : ''
                }`}
              >
                <div className="absolute inset-0 bg-heat-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 mix-blend-overlay" />
                <img 
                  src={img.src} 
                  alt={img.alt} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
