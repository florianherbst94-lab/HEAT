import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Navigation');
  
  return (
    <footer className="bg-heat-anthracite text-heat-chrome border-t border-heat-chrome-dark py-12 mt-20">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <img src="/media/logo.png" alt="Heat Logo" className="h-12 w-auto mb-4" />
          <p className="text-sm">Dress up. Show up. Feel the Heat.</p>
        </div>
        
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
            <li><Link href="/events" className="hover:text-white transition-colors">{t('events')}</Link></li>
            <li><Link href="/community" className="hover:text-white transition-colors">{t('community')}</Link></li>
            <li><Link href="/gallery" className="hover:text-white transition-colors">{t('gallery')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/imprint" className="hover:text-white transition-colors">Impressum</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Datenschutz</Link></li>
            <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie-Einstellungen</Link></li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Social</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a></li>
            <li><a href="https://tiktok.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">TikTok</a></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">{t('contact')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 pt-6 border-t border-heat-chrome-dark text-xs text-center">
        &copy; {new Date().getFullYear()} Heat. All rights reserved.
      </div>
    </footer>
  );
}
