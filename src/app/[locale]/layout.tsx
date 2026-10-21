import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {routing} from '@/i18n/routing';
import {notFound} from 'next/navigation';
import Navigation from '@/components/layout/Navigation';
import AudioPlayer from '@/components/layout/AudioPlayer';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import "../globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HEAT",
  description: "Heat ist mehr als eine Party. Hip-Hop, Afro, R&B, Amapiano.",
  openGraph: {
    title: "HEAT | The First Chapter",
    description: "Heat ist mehr als eine Party. Hip-Hop, Afro, R&B, Amapiano.",
    url: 'https://heatdresden.de',
    siteName: 'HEAT',
    locale: 'de_DE',
    type: 'website',
  }
, icons: { icon: '/media/logo.png', apple: '/media/logo.png' } };

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  
  if (!routing.locales.includes(locale as any)) {
    console.log("NOT FOUND LOCALE:", locale, "AVAILABLE LOCALES:", routing.locales); notFound();
  }
 
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className={`antialiased bg-heat-black text-white min-h-screen flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <AudioPlayer />
          <Navigation locale={locale} />
          <div className="flex-grow pt-24">
            {children}
          </div>
          <Footer />
          <Toaster theme="dark" position="bottom-right" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
