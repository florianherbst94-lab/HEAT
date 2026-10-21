import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

async function checkAdmin() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin_session');
  return adminCookie?.value === 'authenticated';
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('gallery_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const order = formData.get('order') as string;

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('gallery')
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('gallery')
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    const { data: dbData, error: dbError } = await supabaseAdmin
      .from('gallery_images')
      .insert({
        image_url: imageUrl,
        display_order: parseInt(order || '0'),
      })
      .select()
      .single();

    if (dbError) {
      await supabaseAdmin.storage.from('gallery').remove([fileName]);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(dbData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { data: image, error: fetchError } = await supabaseAdmin
      .from('gallery_images')
      .select('image_url')
      .eq('id', id)
      .single();

    if (image) {
      const urlParts = image.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabaseAdmin.storage.from('gallery').remove([fileName]);
    }

    const { error } = await supabaseAdmin
      .from('gallery_images')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
