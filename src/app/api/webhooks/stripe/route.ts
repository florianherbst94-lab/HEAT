import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase'; // In production, use a service role client
import { v4 as uuidv4 } from 'uuid';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any,
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_dummy';

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get('stripe-signature');

  let event: Stripe.Event;

  try {
    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    
    // In production, verify the webhook signature
    if (process.env.STRIPE_WEBHOOK_SECRET && process.env.NODE_ENV === 'production') {
        event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
    } else {
        // Fallback for development/testing without a real webhook secret
        event = JSON.parse(payload) as Stripe.Event;
    }
    
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
    
    const { eventId, buyerName, buyerEmail, items: itemsString } = paymentIntent.metadata;

    if (eventId && buyerName && buyerEmail && itemsString) {
      try {
        const items = JSON.parse(itemsString);
        
        // 1. Create the order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              event_id: eventId,
              buyer_name: buyerName,
              buyer_email: buyerEmail,
              total_amount: paymentIntent.amount / 100, // Convert from cents
              payment_status: 'paid',
              payment_provider: 'stripe',
              payment_intent_id: paymentIntent.id
            }
          ])
          .select('id')
          .single();

        if (orderError || !order) {
          throw new Error(`Failed to create order: ${orderError?.message}`);
        }

        // 2. Create the order items (tickets)
        const orderItems = [];
        
        for (const [ticketId, quantity] of Object.entries(items)) {
          const qty = quantity as number;
          for (let i = 0; i < qty; i++) {
            orderItems.push({
              order_id: order.id,
              ticket_id: ticketId,
              qr_code: uuidv4(),
              status: 'valid'
            });
          }
        }

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
           throw new Error(`Failed to create order items: ${itemsError.message}`);
        }

        // 3. Increment the quantity_sold on the tickets table
        for (const [ticketId, quantity] of Object.entries(items)) {
          const { data: ticket } = await supabase
            .from('tickets')
            .select('quantity_sold')
            .eq('id', ticketId)
            .single();
            
          if (ticket) {
            await supabase
              .from('tickets')
              .update({ quantity_sold: ticket.quantity_sold + (quantity as number) })
              .eq('id', ticketId);
          }
        }

        console.log(`Successfully created order ${order.id} for payment intent ${paymentIntent.id}`);
        
      } catch (e) {
          console.error("Failed to process successful payment intent:", e);
          // Return 500 so Stripe retries the webhook
          return NextResponse.json({ error: 'Internal server error processing payment' }, { status: 500 });
      }
    } else {
        console.warn('Missing metadata in PaymentIntent.');
    }
  }

  return NextResponse.json({ received: true });
}
