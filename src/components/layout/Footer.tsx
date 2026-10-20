
"use client";
import { Link, usePathname } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/access') return null;
  const t = useTranslations('Navigation');
  
  return (
    <footer className="bg-heat-anthracite text-heat-chrome border-t border-heat-chrome-dark py-12 mt-20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src="/media/logo.png" alt="Heat Logo" className="h-12 w-auto mb-4" />
          <p className="text-sm">Dress up. Show up. Feel the Heat.</p>
        </div>
        
        <div>
          <h4 className="text-white font-display font-bold uppercase tracking-widest mb-4">Heat</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
            <li><Link href="/events" className="hover:text-white transition-colors">{t('events')}</Link></li>
            <li><Link href="/fits" className="hover:text-white transition-colors">{t('fits')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-display font-bold uppercase tracking-widest mb-4">Rechtliches</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy" className="hover:text-white transition-colors">Datenschutz</Link></li>
            <li><Link href="/legal" className="hover:text-white transition-colors">Impressum</Link></li>
            <li><Link href="/legal" className="hover:text-white transition-colors">AGB</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-display font-bold uppercase tracking-widest mb-4">Connect</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://instagram.com/heatdresden" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
            <li><a href="https://tiktok.com/@heatdresden" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">TikTok</a></li>
            <li><a href="mailto:info@heatdresden.de" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-6 mt-12 pt-8 border-t border-heat-chrome-dark text-xs text-center">
        <p>&copy; {new Date().getFullYear()} Heat. All rights reserved.</p>
      </div>
    </footer>
  );
}
