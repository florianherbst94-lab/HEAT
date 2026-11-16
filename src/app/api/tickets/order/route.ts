import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('order_items')
      .select(`
        id,
        qr_code,
        status,
        ticket:tickets(name, price),
        order:orders(
          buyer_name,
          event:events(title, date, start_time, location_name, city, image_url)
        )
      `)
      .eq('order_id', orderId);

    if (error) throw error;
    
    return NextResponse.json({ tickets: data });
  } catch (error: any) {
    console.error('Error fetching tickets for order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
