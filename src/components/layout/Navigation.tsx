'use client';

import { useState, useEffect } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Navigation({ locale }: { locale: string }) {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/events', label: t('events') },
    { href: '/fits', label: t('fits') },
    { href: '/community', label: t('community') },
    { href: '/gallery', label: t('gallery') },
  ];

  return (
    <nav
      className={clsx(
        'fixed top-0 w-full z-50 transition-all duration-300',
        scrolled ? 'bg-heat-black/90 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'
      )}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <img src="/media/logo.png" alt="Heat Logo" className="h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                'text-sm uppercase tracking-wider font-semibold transition-colors duration-200',
                pathname === link.href ? 'text-heat-red' : 'text-white hover:text-heat-chrome'
              )}
            >
              {link.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <Link href={pathname} locale="de" className={clsx(locale === 'de' ? 'text-heat-red' : 'text-heat-chrome hover:text-white')}>DE</Link>
            <span className="text-heat-chrome-dark">/</span>
            <Link href={pathname} locale="en" className={clsx(locale === 'en' ? 'text-heat-red' : 'text-heat-chrome hover:text-white')}>EN</Link>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Nav Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-heat-black border-t border-heat-anthracite shadow-2xl py-6 px-6 flex flex-col space-y-6 md:hidden"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={clsx(
                  'text-lg uppercase tracking-wider font-bold',
                  pathname === link.href ? 'text-heat-red' : 'text-white'
                )}
              >
                {link.label}
              </Link>
            ))}
            
            <div className="flex items-center space-x-4 pt-4 border-t border-heat-anthracite">
              <Link href={pathname} locale="de" onClick={() => setIsOpen(false)} className={clsx('text-lg font-bold', locale === 'de' ? 'text-heat-red' : 'text-heat-chrome')}>DE</Link>
              <span className="text-heat-chrome-dark">/</span>
              <Link href={pathname} locale="en" onClick={() => setIsOpen(false)} className={clsx('text-lg font-bold', locale === 'en' ? 'text-heat-red' : 'text-heat-chrome')}>EN</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
