'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import QRCodeGenerator from '@/components/ui/QRCodeGenerator';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TicketData {
  id: string;
  qr_code: string;
  status: string;
  ticket: {
    name: string;
  };
  order: {
    buyer_name: string;
    event: {
      title: string;
      date: string;
    }
  };
}

export default function TicketSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('order_items')
          .select(`
            id,
            qr_code,
            status,
            ticket:tickets(name),
            order:orders(
              buyer_name,
              event:events(title, date)
            )
          `)
          .eq('order_id', orderId);

        if (error) throw error;
        // The data returned by supabase with joins needs a bit of typing help
        setTickets((data as unknown) as TicketData[]);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        toast.error('Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [orderId]);

  if (loading) {
    return <main className="min-h-screen bg-heat-black pt-32 pb-24 flex justify-center"><div className="text-heat-chrome">Loading your tickets...</div></main>;
  }

  if (!orderId || tickets.length === 0) {
    return (
      <main className="min-h-screen bg-heat-black pt-32 pb-24">
         <div className="container mx-auto px-6 max-w-2xl text-center">
            <h1 className="font-display text-4xl font-bold text-white mb-4 uppercase tracking-widest">No Tickets Found</h1>
            <p className="text-heat-chrome mb-8">We could not find the tickets you are looking for.</p>
            <Link href="/" className="inline-block text-heat-chrome hover:text-white uppercase tracking-wider text-sm font-semibold border-b border-heat-chrome hover:border-white transition-all pb-1">
              Return to Home
            </Link>
         </div>
      </main>
    );
  }

  const eventTitle = tickets[0]?.order?.event?.title || 'Heat Event';
  const eventDate = tickets[0]?.order?.event?.date || '';

  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4 text-white">
            Order Complete
          </h1>
          <p className="text-heat-chrome-light mb-2">
            You successfully purchased {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} for
          </p>
          <p className="text-white text-xl font-bold font-display uppercase tracking-widest">
            {eventTitle}
          </p>
          {eventDate && <p className="text-heat-red mt-1">{new Date(eventDate).toLocaleDateString()}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {tickets.map((ticket, index) => (
            <motion.div 
              key={ticket.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white p-8 relative overflow-hidden flex flex-col items-center"
            >
              {/* Ticket Design */}
              <div className="absolute top-0 left-0 w-full h-2 bg-heat-red" />
              
              <div className="flex flex-col items-center text-center pb-6 border-b border-dashed border-gray-300 w-full">
                <img src="/media/logo.png" alt="Heat Logo" className="h-6 mb-4" style={{ filter: 'invert(1)' }} />
                <h2 className="font-display text-2xl font-bold text-black uppercase tracking-wider mb-1">Ticket {index + 1}</h2>
                <p className="text-heat-red font-bold tracking-widest uppercase text-xs">{ticket.ticket.name}</p>
                <p className="text-gray-500 text-xs mt-2">{ticket.order.buyer_name}</p>
              </div>

              <div className="flex flex-col items-center pt-6 w-full">
                <QRCodeGenerator value={ticket.qr_code} size={150} />
                <p className="mt-4 text-gray-400 font-mono text-[10px] tracking-[0.2em]">{ticket.qr_code.substring(0, 8)}...</p>
              </div>

              {/* Wallet Buttons */}
              <div className="mt-8 flex flex-col gap-3 w-full">
                <a 
                  href={`/api/tickets/${ticket.id}/apple-wallet`}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-lg py-3 hover:bg-gray-900 transition-colors"
                >
                  <svg viewBox="0 0 384 384" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63 140.3 0 197.6 0 286.2c0 20.2 5.5 45.4 12.8 65.5 15.6 42.4 34.2 75.4 62.4 75.4 24.6 0 43.4-17.7 85.3-17.7s61 17.5 86.8 17.5c24.6 0 46-34.9 61.2-76.7 10.1-27.1 10.4-27.9 10.2-28.9-1.2-1-31.5-12.2-31.5-52.6zM225.9 89.2c20.3-25.2 30-54.8 26.6-89.2-28.5 1.5-58.4 18.2-78.1 41.5-17.5 20.4-29.3 49.3-25.5 82.2 32.4 2.1 56.6-11 77-34.5z"/></svg>
                  <span>Add to Apple Wallet</span>
                </a>
                
                <a 
                  href={`/api/tickets/${ticket.id}/google-wallet`}
                  className="w-full flex items-center justify-center gap-2 bg-[#1f1f1f] text-white rounded-lg py-3 hover:bg-[#333] transition-colors border border-gray-700"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" fill="#fff"/>
                  </svg>
                  <span>Add to Google Wallet</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/" className="inline-block text-heat-chrome hover:text-white uppercase tracking-wider text-sm font-semibold border-b border-heat-chrome hover:border-white transition-all pb-1">
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
