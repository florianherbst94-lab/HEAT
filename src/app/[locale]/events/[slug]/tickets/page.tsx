'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TicketOption {
  id: string;
  category: string;
  price: number;
  description: string;
  quantity_total: number;
  quantity_sold: number;
  presale_fee_fixed: number;
  presale_fee_percent: number;
  status: string;
}

export default function TicketShopPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [tickets, setTickets] = useState<TicketOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data, error } = await supabase
          .from('tickets')
          .select('*')
          .eq('event_id', slug)
          .eq('status', 'active')
          .order('price', { ascending: true });

        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchTickets();
    }
  }, [slug]);
  
  const handleQuantityChange = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const newCart = { ...prev };
        delete newCart[id];
        return newCart;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((total, [id, qty]) => {
    const ticket = tickets.find(t => t.id === id);
    if (!ticket) return total;
    const fee = ticket.presale_fee_fixed + (ticket.price * (ticket.presale_fee_percent / 100));
    return total + ((ticket.price + fee) * qty);
  }, 0);

  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <span className="inline-block px-4 py-1 border border-heat-red text-heat-red font-bold text-sm tracking-widest uppercase mb-6">
            Ticket Shop
          </span>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-widest uppercase mb-4 text-white">
            Select Tickets
          </h1>
          <p className="text-heat-chrome-light text-lg">
            Choose your tickets for the upcoming Heat events.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Ticket Selection */}
          <div className="md:col-span-2 space-y-6">
            {loading ? (
              <div className="text-heat-chrome p-8 text-center bg-heat-anthracite/30 border border-heat-chrome-dark">
                Loading tickets...
              </div>
            ) : tickets.length === 0 ? (
              <div className="text-heat-chrome p-8 text-center bg-heat-anthracite/30 border border-heat-chrome-dark">
                No tickets currently available for this event.
              </div>
            ) : (
              tickets.map((ticket) => {
                const fee = ticket.presale_fee_fixed + (ticket.price * (ticket.presale_fee_percent / 100));
                const available = ticket.quantity_total - ticket.quantity_sold;
                const isSoldOut = available <= 0;

                return (
                  <motion.div 
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-heat-anthracite/30 border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 transition-colors ${isSoldOut ? 'border-heat-red/50 opacity-75' : 'border-heat-chrome-dark'}`}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">{ticket.category}</h3>
                        {isSoldOut && (
                          <span className="text-xs font-bold text-white bg-heat-red px-2 py-1 uppercase tracking-widest">Sold Out</span>
                        )}
                      </div>
                      <p className="text-heat-chrome text-sm mb-4">{ticket.description}</p>
                      <div className="flex items-end gap-2">
                        <p className="text-2xl font-display text-heat-chrome-light">€{ticket.price.toFixed(2)}</p>
                        {fee > 0 && (
                          <p className="text-heat-chrome text-xs mb-1">+ €{fee.toFixed(2)} fee</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center space-x-4 bg-heat-black border border-heat-chrome-dark p-2">
                        <button 
                          onClick={() => handleQuantityChange(ticket.id, -1)}
                          disabled={isSoldOut}
                          className="w-8 h-8 flex items-center justify-center text-heat-chrome hover:text-white transition-colors disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-white font-bold">{cart[ticket.id] || 0}</span>
                        <button 
                          onClick={() => handleQuantityChange(ticket.id, 1)}
                          disabled={isSoldOut || (cart[ticket.id] || 0) >= Math.min(10, available)}
                          className="w-8 h-8 flex items-center justify-center text-heat-chrome hover:text-white transition-colors disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                      {!isSoldOut && available <= 20 && (
                        <span className="text-heat-red text-xs font-bold uppercase tracking-widest animate-pulse">
                          Only {available} left!
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Cart Summary */}
          <div className="md:col-span-1">
            <div className="bg-heat-anthracite/50 border border-heat-chrome-dark p-6 sticky top-32">
              <h2 className="font-display text-2xl font-bold text-white uppercase tracking-widest mb-6 border-b border-heat-chrome-dark pb-4">
                Your Order
              </h2>
              
              {totalItems === 0 ? (
                <p className="text-heat-chrome text-sm mb-8">Your cart is empty.</p>
              ) : (
                <div className="space-y-4 mb-8">
                  {Object.entries(cart).map(([id, qty]) => {
                    const ticket = tickets.find(t => t.id === id);
                    if (!ticket) return null;
                    const fee = ticket.presale_fee_fixed + (ticket.price * (ticket.presale_fee_percent / 100));
                    return (
                      <div key={id} className="flex justify-between text-sm">
                        <span className="text-heat-chrome-light">{qty}x {ticket.category}</span>
                        <span className="text-white">€{((ticket.price + fee) * qty).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-heat-chrome-dark pt-4 mt-4 flex justify-between font-bold text-lg">
                    <span className="text-white uppercase tracking-wider">Total</span>
                    <span className="text-heat-red">€{totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <Link 
                href={totalItems > 0 ? `/events/${slug}/tickets/checkout` : "#"} 
                className={`w-full block text-center font-bold uppercase tracking-widest py-4 transition-all duration-300 ${
                  totalItems > 0 
                    ? 'bg-heat-red text-white hover:bg-heat-wine shadow-[0_0_15px_rgba(255,42,42,0.4)]' 
                    : 'bg-heat-chrome-dark text-heat-chrome cursor-not-allowed'
                }`}
                onClick={(e) => {
                  if (totalItems === 0) e.preventDefault();
                  if (totalItems > 0) {
                    // Quick way to pass cart data to checkout without global state for now
                    sessionStorage.setItem('heat_cart', JSON.stringify(cart));
                  }
                }}
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
