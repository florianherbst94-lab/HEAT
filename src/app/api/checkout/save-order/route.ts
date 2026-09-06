import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Using the client side client for simplicity in this MVP, in prod use a service role client
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, eventId, buyerName, buyerEmail, totalAmount, paymentIntentId, paymentProvider } = body;

    if (!items || !eventId || !buyerName || !buyerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([
        {
          event_id: eventId,
          buyer_name: buyerName,
          buyer_email: buyerEmail,
          total_amount: totalAmount,
          payment_status: 'paid',
          payment_provider: paymentProvider,
          payment_intent_id: paymentIntentId
        }
      ])
      .select('id')
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // 2. Create the order items (tickets)
    const orderItems = [];
    
    // Convert items object { 'ticketId': quantity } to array of order items
    for (const [ticketId, quantity] of Object.entries(items)) {
      const qty = quantity as number;
      for (let i = 0; i < qty; i++) {
        orderItems.push({
          order_id: order.id,
          ticket_id: ticketId,
          qr_code: uuidv4(), // Generate a unique QR code string for each ticket
          status: 'valid'
        });
      }
    }

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      return NextResponse.json({ error: 'Failed to create order items' }, { status: 500 });
    }

    // 3. Increment the quantity_sold on the tickets table
    // In a real app, this should be done via a secure database function (RPC) to prevent race conditions.
    // For this MVP, we do it via simple updates.
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

    return NextResponse.json({ success: true, orderId: order.id });

  } catch (error: unknown) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
