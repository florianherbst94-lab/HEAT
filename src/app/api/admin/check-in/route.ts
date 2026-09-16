import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    // Basic auth check
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { qrCode } = body;

    if (!qrCode) {
      return NextResponse.json({ error: 'QR Code is required' }, { status: 400 });
    }

    // Find the ticket item
    const { data: ticketItem, error: fetchError } = await supabaseAdmin
      .from('order_items')
      .select('id, status, ticket_id, orders(buyer_name)')
      .eq('qr_code', qrCode)
      .single();

    if (fetchError || !ticketItem) {
      return NextResponse.json({ valid: false, message: 'Ticket not found' });
    }

    if (ticketItem.status !== 'valid') {
      return NextResponse.json({ valid: false, message: `Ticket is already ${ticketItem.status}` });
    }

    // Get ticket details (category)
    const { data: ticketDetails } = await supabaseAdmin
      .from('tickets')
      .select('category')
      .eq('id', ticketItem.ticket_id)
      .single();

    // Mark as scanned
    const { error: updateError } = await supabaseAdmin
      .from('order_items')
      .update({ status: 'scanned' })
      .eq('id', ticketItem.id);

    if (updateError) {
      throw new Error(`Failed to update ticket status: ${updateError.message}`);
    }

    // Handle array case for one-to-many relationship mapping in postgrest, though here it's theoretically one-to-one
    const ordersData = ticketItem.orders as any;
    const buyerName = Array.isArray(ordersData) ? ordersData[0]?.buyer_name : ordersData?.buyer_name;

    return NextResponse.json({ 
      valid: true, 
      buyerName: buyerName || 'Unknown',
      category: ticketDetails?.category || 'Standard Ticket'
    });

  } catch (error: any) {
    console.error('Check-in error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
