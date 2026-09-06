import { Metadata } from 'next';
import { getCampaignEntries } from '@/lib/fits';
import HeatFitsPage from '../page';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  return {
    title: 'Vote for my HEAT FIT 🔥 | HEAT Dresden',
    description: 'Check out my outfit for HEAT FITS and vote for your favorite looks!',
    openGraph: {
      title: 'Vote for my HEAT FIT 🔥 | HEAT Dresden',
      description: 'Check out my outfit for HEAT FITS and vote for your favorite looks!',
      url: `https://heatdresden.de/fits/${id}`,
      siteName: 'HEAT Dresden',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&h=630&q=80',
          width: 1200,
          height: 630,
          alt: 'HEAT FIT',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Vote for my HEAT FIT 🔥',
      description: 'Vote for my outfit on HEAT FITS!',
    },
  };
}

export default function SingleFitSharePage() {
  return <HeatFitsPage />;
}
