import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Check if it's an update
    if (body.id) {
      const { id, ...updateData } = body;
      const { data, error } = await supabaseAdmin
        .from('events')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json({ data });
    } else {
      // It's a new insert
      const { data, error } = await supabaseAdmin
        .from('events')
        .insert([body])
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json({ data });
    }

  } catch (error: any) {
    console.error('Event API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session');
    
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error('Event API Delete Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
