import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import QRCode from 'qrcode';
import { TicketEmail } from '@/emails/TicketEmail';
import React from 'react';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16' as any,
});

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456789');
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
        const { data: order, error: orderError } = await supabaseAdmin
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
        const ticketsForEmail = [];
        
        for (const [ticketId, quantity] of Object.entries(items)) {
          const qty = quantity as number;
          
          // Get ticket details for email
          const { data: ticketDetails } = await supabaseAdmin
            .from('tickets')
            .select('category, event_id')
            .eq('id', ticketId)
            .single();
            
          for (let i = 0; i < qty; i++) {
            const qrCodeValue = `HEAT-${uuidv4()}`; // Example: HEAT-abc-123
            
            orderItems.push({
              order_id: order.id,
              ticket_id: ticketId,
              qr_code: qrCodeValue,
              status: 'valid'
            });
            
            // Generate Base64 QR code image for email
            const qrCodeDataUrl = await QRCode.toDataURL(qrCodeValue, {
              width: 300,
              margin: 2,
              color: {
                dark: '#000000',
                light: '#ffffff'
              }
            });
            
            ticketsForEmail.push({
              category: ticketDetails?.category || 'HEAT Ticket',
              qrCodeUrl: qrCodeDataUrl,
              ticketId: qrCodeValue
            });
          }
        }

        const { error: itemsError } = await supabaseAdmin
          .from('order_items')
          .insert(orderItems);

        if (itemsError) {
           throw new Error(`Failed to create order items: ${itemsError.message}`);
        }

        // 3. Increment the quantity_sold on the tickets table
        for (const [ticketId, quantity] of Object.entries(items)) {
          const { data: ticket } = await supabaseAdmin
            .from('tickets')
            .select('quantity_sold')
            .eq('id', ticketId)
            .single();
            
          if (ticket) {
            await supabaseAdmin
              .from('tickets')
              .update({ quantity_sold: ticket.quantity_sold + (quantity as number) })
              .eq('id', ticketId);
          }
        }
        
        // 4. Send Email via Resend
        if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789') {
          // Get event details for email
          const { data: eventDetails } = await supabaseAdmin
            .from('events')
            .select('title, date')
            .eq('id', eventId)
            .single();
            
          const eventDateStr = eventDetails?.date ? new Date(eventDetails.date).toLocaleDateString('de-DE') : 'TBA';
            
          await resend.emails.send({
            from: 'Heat Tickets <tickets@heatdresden.de>',
            to: buyerEmail,
            subject: `Deine HEAT Tickets für ${eventDetails?.title || 'das kommende Event'}`,
            react: React.createElement(TicketEmail, {
              buyerName: buyerName.split(' ')[0], // First name
              eventName: eventDetails?.title || 'Heat Night',
              eventDate: eventDateStr,
              tickets: ticketsForEmail
            })
          });
          console.log(`Sent email to ${buyerEmail} for order ${order.id}`);
        } else {
          console.log('Skipped email sending because RESEND_API_KEY is missing or invalid.');
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

