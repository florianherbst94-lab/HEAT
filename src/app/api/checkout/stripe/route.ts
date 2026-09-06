import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase'; // Using the client side client for simplicity in this MVP, in prod use a service role client

// Initialize Stripe with a dummy key if env var is missing during development/MVP
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, eventId, buyerName, buyerEmail } = body;

    // 1. Calculate total amount server-side to prevent tampering
    // Fetch tickets from Supabase to get real prices
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .in('id', Object.keys(items));

    if (ticketsError) throw ticketsError;

    let totalAmount = 0;
    
    tickets?.forEach(ticket => {
      const qty = items[ticket.id];
      if (qty > 0) {
        const fee = ticket.presale_fee_fixed + (ticket.price * (ticket.presale_fee_percent / 100));
        totalAmount += (ticket.price + fee) * qty;
      }
    });

    if (totalAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // 2. Create a Stripe PaymentIntent
    // We multiply by 100 because Stripe expects amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalAmount * 100),
      currency: 'eur',
      // In a real app, you might want to create the order in Supabase first with status 'pending'
      // and attach the order ID to the payment intent metadata.
      metadata: {
        eventId,
        buyerName,
        buyerEmail,
        items: JSON.stringify(items)
      },
    });

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret,
      totalAmount 
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
