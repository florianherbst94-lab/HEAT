'use client';

import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';

export default function GalleryPreview() {
  const t = useTranslations('Navigation');
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    async function fetchImages() {
      try {
        const res = await fetch('/api/admin/gallery');
        if (res.ok) {
          const data = await res.json();
          // We might only want to show the first 4 on the preview
          setImages(data.slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchImages();
  }, []);

  // Use fallback images if none exist in the database yet
  const displayImages = images.length > 0 ? images.map((img, idx) => {
    // Dynamic styling based on position to recreate the asymmetric grid
    let className = 'col-span-1 row-span-1 aspect-square';
    if (idx === 0) className = 'col-span-2 row-span-2 aspect-[4/5]';
    else if (idx === 3) className = 'col-span-2 row-span-1 aspect-[2/1]';
    return { src: img.image_url, className };
  }) : [
    { src: '/media/DSC07704.jpg', className: 'col-span-2 row-span-2 aspect-[4/5]' },
    { src: '/media/DSC04721.jpg', className: 'col-span-1 row-span-1 aspect-square' },
    { src: '/media/DSC09435.jpg', className: 'col-span-1 row-span-1 aspect-square' },
    { src: '/media/DSC02719.jpg', className: 'col-span-2 row-span-1 aspect-[2/1]' },
  ];

  return (
    <section className="py-24 bg-heat-black border-t border-heat-anthracite">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex justify-between items-end mb-12">
          <h2 className="font-display text-4xl md:text-6xl font-bold tracking-widest uppercase">
            HEAT <span className="text-heat-red">VIBES</span>
          </h2>
          <Link href="/gallery" className="hidden md:inline-block text-heat-chrome hover:text-white uppercase tracking-wider text-sm font-semibold border-b border-heat-chrome hover:border-white transition-all pb-1">
            VIEW FULL {t('gallery')}
          </Link>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayImages.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`overflow-hidden group cursor-pointer ${img.className} object-cover rounded-sm`}
            >
              <img 
                src={img.src} 
                alt="Heat Event" 
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" 
              />
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/gallery" className="inline-block text-heat-chrome hover:text-white uppercase tracking-wider text-sm font-semibold border-b border-heat-chrome pb-1">
            VIEW FULL {t('gallery')}
          </Link>
        </div>
      </div>
    </section>
  );
}