'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function GalleryPage() {
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/admin/gallery');
        if (res.ok) {
          const data = await res.json();
          setImages(data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchImages();
  }, []);

  const fallbackImages = [
    { src: '/media/DSC04419.jpg', alt: 'Heat Event 1' },
    { src: '/media/DSC05031.jpg', alt: 'Heat Event 2' },
    { src: '/media/DSC05191.jpg', alt: 'Heat Event 3' },
    { src: '/media/DSC05215.jpg', alt: 'Heat Event 4' },
    { src: '/media/DSC05256.jpg', alt: 'Heat Event 5' },
    { src: '/media/DSC05408.jpg', alt: 'Heat Event 6' },
  ];

  const displayImages = images.length > 0 ? images.map(img => ({ src: img.image_url, alt: 'Heat Gallery' })) : fallbackImages;

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
            {displayImages.map((img, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i % 3 * 0.1 }}
                className={`relative group overflow-hidden bg-heat-anthracite ${
                  i % 6 === 1 ? 'row-span-2' : 
                  i % 6 === 2 ? 'col-span-1 md:col-span-2' : 
                  i % 6 === 5 ? 'row-span-2' : ''
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