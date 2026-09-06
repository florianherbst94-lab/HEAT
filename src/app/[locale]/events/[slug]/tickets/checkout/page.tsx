'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from '@/i18n/routing';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Flame, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

interface TicketData {
  id: string;
  category: string;
  price: number;
  presale_fee_fixed: number;
  presale_fee_percent: number;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [tickets, setTickets] = useState<TicketData[]>([]);

  // Member State
  const [isMember, setIsMember] = useState(false);
  const [memberData, setMemberData] = useState<any | null>(null);
  const [checkoutMode, setCheckoutMode] = useState<'guest' | 'join_club'>('guest');
  const [joinWhatsAppOptIn, setJoinWhatsAppOptIn] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    paymentMethod: 'stripe',
  });

  useEffect(() => {
    // Check if user is logged in as HEAT Member
    const checkMember = async () => {
      try {
        const res = await fetch('/api/community/me');
        const data = await res.json();
        if (data.authenticated && data.member) {
          setIsMember(true);
          setMemberData(data.member);
          setFormData((prev) => ({
            ...prev,
            firstName: data.member.first_name || '',
            lastName: data.member.last_name || '',
            email: data.member.email || '',
          }));
        }
      } catch (err) {
        console.error('Check member error:', err);
      }
    };
    checkMember();

    // Load cart from session storage
    const storedCart = sessionStorage.getItem('heat_cart');
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      setCart(parsedCart);

      if (Object.keys(parsedCart).length === 0) {
        router.push(`/events/${slug}/tickets`);
        return;
      }

      // Fetch ticket data for the items in cart
      const fetchTickets = async () => {
        try {
          const { data, error } = await supabase
            .from('tickets')
            .select('id, category, price, presale_fee_fixed, presale_fee_percent')
            .in('id', Object.keys(parsedCart));

          if (error) throw error;
          setTickets(data || []);
        } catch (error) {
          console.error('Error fetching tickets:', error);
          toast.error('Error loading checkout');
        } finally {
          setLoading(false);
        }
      };

      fetchTickets();
    } else {
      router.push(`/events/${slug}/tickets`);
    }
  }, [slug, router]);

  const totalAmount = Object.entries(cart).reduce((total, [id, qty]) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return total;
    const fee = ticket.presale_fee_fixed + ticket.price * (ticket.presale_fee_percent / 100);
    return total + (ticket.price + fee) * qty;
  }, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      // If user selected to join HEAT Club during checkout
      if (!isMember && checkoutMode === 'join_club' && formData.email && formData.firstName) {
        try {
          await fetch('/api/community/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              first_name: formData.firstName,
              last_name: formData.lastName,
              email: formData.email,
              is_18_plus: true,
              terms_accepted: true,
              whatsapp_opt_in: joinWhatsAppOptIn,
              whatsapp_opt_in_source: 'ticket_checkout_join',
            }),
          });
        } catch (err) {
          console.warn('Checkout member creation warning:', err);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Call our internal API to save the order
      const res = await fetch('/api/checkout/save-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          eventId: slug,
          buyerName: `${formData.firstName} ${formData.lastName}`,
          buyerEmail: formData.email,
          totalAmount: totalAmount,
          paymentProvider: formData.paymentMethod,
          paymentIntentId: `pi_mock_${Math.random().toString(36).substring(7)}`,
        }),
      });

      if (!res.ok) throw new Error('Failed to save order');

      const data = await res.json();
      setOrderId(data.orderId);

      // Clear cart
      sessionStorage.removeItem('heat_cart');
      setStep(3);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-heat-black pt-32 pb-24 flex justify-center">
        <div className="text-heat-chrome">Loading Checkout...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-heat-black pt-32 pb-24">
      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-heat-anthracite/50 border border-heat-chrome-dark p-8 md:p-12 shadow-2xl relative"
        >
          {/* Progress Bar */}
          <div className="flex justify-between items-center mb-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-heat-chrome-dark -z-10" />

            <div className={`flex flex-col items-center bg-heat-anthracite px-4 py-2 rounded-full border ${step >= 1 ? 'border-heat-red text-white' : 'border-heat-chrome-dark text-heat-chrome'}`}>
              <span className="text-xs uppercase tracking-widest font-bold">1. Info</span>
            </div>
            <div className={`flex flex-col items-center bg-heat-anthracite px-4 py-2 rounded-full border ${step >= 2 ? 'border-heat-red text-white' : 'border-heat-chrome-dark text-heat-chrome'}`}>
              <span className="text-xs uppercase tracking-widest font-bold">2. Payment</span>
            </div>
            <div className={`flex flex-col items-center bg-heat-anthracite px-4 py-2 rounded-full border ${step >= 3 ? 'border-heat-red text-white' : 'border-heat-chrome-dark text-heat-chrome'}`}>
              <span className="text-xs uppercase tracking-widest font-bold">3. Done</span>
            </div>
          </div>

          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-white mb-6 uppercase tracking-widest border-b border-heat-chrome-dark pb-4">
                Personal Information
              </h2>

              {/* HEAT CLUB Member Badge or Guest Options */}
              {isMember && memberData ? (
                <div className="bg-heat-black border border-heat-red/60 p-4 rounded-sm mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Flame className="w-5 h-5 text-heat-red fill-heat-red" />
                    <div>
                      <span className="text-xs text-heat-red font-bold uppercase tracking-wider block">
                        ANGEMELDET ALS HEAT MEMBER
                      </span>
                      <span className="text-white font-bold text-sm">
                        {memberData.first_name} {memberData.last_name || ''} ({memberData.member_number})
                      </span>
                    </div>
                  </div>
                  <span className="text-green-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Aktiv
                  </span>
                </div>
              ) : (
                <div className="bg-heat-black border border-heat-chrome-dark p-4 rounded-sm space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-heat-red">
                    <Flame className="w-4 h-4" /> HEAT CLUB MITGLIEDSCHAFT & VORTEILE
                  </div>
                  <p className="text-xs text-heat-chrome-light leading-relaxed">
                    Erhalte exklusiven Zugang zu Gästelisten-Drops, Secret Releases & voten bei HEAT FITS!
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <label className={`flex-1 border p-3 rounded-sm cursor-pointer transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${checkoutMode === 'guest' ? 'border-white text-white bg-heat-anthracite/60' : 'border-heat-chrome-dark text-zinc-400'}`}>
                      <input
                        type="radio"
                        name="checkoutMode"
                        checked={checkoutMode === 'guest'}
                        onChange={() => setCheckoutMode('guest')}
                        className="accent-heat-red"
                      />
                      Als Gast bestellen
                    </label>

                    <label className={`flex-1 border p-3 rounded-sm cursor-pointer transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${checkoutMode === 'join_club' ? 'border-heat-red text-white bg-heat-red/10' : 'border-heat-chrome-dark text-zinc-400'}`}>
                      <input
                        type="radio"
                        name="checkoutMode"
                        checked={checkoutMode === 'join_club'}
                        onChange={() => setCheckoutMode('join_club')}
                        className="accent-heat-red"
                      />
                      Gratis HEAT CLUB Mitglied werden 🔥
                    </label>
                  </div>

                  {checkoutMode === 'join_club' && (
                    <div className="pt-2 border-t border-heat-chrome-dark text-xs space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer text-heat-chrome-light">
                        <input
                          type="checkbox"
                          checked={joinWhatsAppOptIn}
                          onChange={(e) => setJoinWhatsAppOptIn(e.target.checked)}
                          className="accent-heat-red"
                        />
                        <span>Ich möchte HEAT Updates & Secret Drops auch per WhatsApp erhalten.</span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-heat-chrome mb-2">Email Address (Tickets will be sent here)</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-heat-black border border-heat-chrome-dark px-4 py-3 text-white focus:border-heat-red outline-none transition-colors" />
              </div>
              <button type="submit" className="w-full bg-heat-red text-white font-bold uppercase tracking-widest py-4 mt-8 hover:bg-heat-wine transition-colors duration-300">
                Continue to Payment
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <h2 className="font-display text-3xl font-bold text-white mb-6 uppercase tracking-widest border-b border-heat-chrome-dark pb-4">
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className="flex items-center space-x-4 border border-heat-chrome-dark p-4 cursor-pointer hover:border-white transition-colors bg-heat-black">
                  <input type="radio" name="paymentMethod" value="stripe" checked={formData.paymentMethod === 'stripe'} onChange={handleInputChange} required className="text-heat-red" />
                  <span className="text-white font-bold uppercase tracking-wider">Credit Card / Apple Pay (Mock)</span>
                </label>
                <label className="flex items-center space-x-4 border border-heat-chrome-dark p-4 cursor-pointer hover:border-white transition-colors bg-heat-black">
                  <input type="radio" name="paymentMethod" value="paypal" checked={formData.paymentMethod === 'paypal'} onChange={handleInputChange} required className="text-heat-red" />
                  <span className="text-white font-bold uppercase tracking-wider">PayPal (Mock)</span>
                </label>
              </div>

              <div className="bg-heat-black border border-heat-chrome-dark p-6 mt-8">
                <p className="text-heat-chrome text-sm mb-4">Total Amount to pay:</p>
                <p className="text-4xl font-display text-white mb-2">€{totalAmount.toFixed(2)}</p>
                <p className="text-heat-red text-xs uppercase tracking-widest">Demo Mode - No real charge</p>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} disabled={processing} className="w-1/3 bg-heat-black border border-heat-chrome text-white font-bold uppercase tracking-widest py-4 mt-8 hover:bg-white hover:text-heat-black transition-colors duration-300 disabled:opacity-50">
                  Back
                </button>
                <button type="submit" disabled={processing} className="w-2/3 bg-heat-red text-white font-bold uppercase tracking-widest py-4 mt-8 hover:bg-heat-wine transition-colors duration-300 flex items-center justify-center disabled:opacity-50">
                  {processing ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-heat-red/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-heat-red">
                <svg className="w-10 h-10 text-heat-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-4xl font-bold text-white mb-4 uppercase tracking-widest">
                Payment Successful
              </h2>
              <p className="text-heat-chrome-light mb-8 max-w-md mx-auto">
                Thank you for your purchase. Your tickets and QR codes have been sent to your email address.
              </p>

              <Link href={`/tickets/success${orderId ? `?order_id=${orderId}` : ''}`} className="inline-block px-8 py-4 bg-white text-heat-black font-bold uppercase tracking-widest text-sm hover:bg-heat-red hover:text-white transition-all duration-300">
                View Your Tickets
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
