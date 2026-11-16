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

export async function POST(req: Request) {
  try {
    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json({ error: 'Missing paymentIntentId' }, { status: 400 });
    }

    // Fetch PaymentIntent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json({ error: 'Payment not successful' }, { status: 400 });
    }

    // Check if order already exists
    const { data: existingOrder } = await supabaseAdmin
      .from('orders')
      .select('id')
      .eq('payment_intent_id', paymentIntent.id)
      .single();

    if (existingOrder) {
      return NextResponse.json({ success: true, order_id: existingOrder.id });
    }

    const { eventId, buyerName, buyerEmail, items: itemsString } = paymentIntent.metadata;

    if (!eventId || !buyerName || !buyerEmail || !itemsString) {
      return NextResponse.json({ error: 'Missing metadata in PaymentIntent' }, { status: 400 });
    }

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
        const qrCodeValue = `HEAT-${uuidv4()}`;
        
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
          color: { dark: '#000000', light: '#ffffff' }
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
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_123456789' && process.env.RESEND_API_KEY !== '[SENSITIVE]') {
      const { data: eventDetails } = await supabaseAdmin
        .from('events')
        .select('title, date, location_name, city, image_url')
        .eq('id', eventId)
        .single();
        
      const eventDateStr = eventDetails?.date ? new Date(eventDetails.date).toLocaleDateString('de-DE') : 'TBA';
      
      const { generateTicketPDF } = await import('@/lib/pdf/ticketPdf');
      const attachments = [];
      
      for (let i = 0; i < ticketsForEmail.length; i++) {
        const ticket = ticketsForEmail[i];
        const pdfBuffer = await generateTicketPDF(
          eventDetails?.title || 'Heat Event',
          eventDateStr,
          buyerName,
          ticket.category,
          ticket.ticketId,
          eventDetails?.location_name || '',
          eventDetails?.city || '',
          eventDetails?.image_url || ''
        );
        
        attachments.push({
          filename: `HEAT-Ticket-${i + 1}.pdf`,
          content: pdfBuffer,
        });
      }
        
      await resend.emails.send({
        from: 'Heat Tickets <tickets@heatdresden.de>',
        to: buyerEmail,
        subject: `Deine HEAT Tickets für ${eventDetails?.title || 'das kommende Event'}`,
        attachments: attachments,
        react: React.createElement(TicketEmail, {
          buyerName: buyerName.split(' ')[0],
          eventName: eventDetails?.title || 'Heat Night',
          eventDate: eventDateStr,
          tickets: ticketsForEmail
        })
      });
    }

    return NextResponse.json({ success: true, order_id: order.id });

  } catch (error: any) {
    console.error('Confirm checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
