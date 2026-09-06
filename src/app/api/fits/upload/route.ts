import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getMemberBySessionToken } from '@/lib/community';
import { getActiveCampaign, createFitEntry } from '@/lib/fits';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs/promises';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('heat_member_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Bitte melde dich an, um dein Outfit hochzuladen.' }, { status: 401 });
    }

    const member = await getMemberBySessionToken(token);
    if (!member) {
      return NextResponse.json({ error: 'Mitgliedskonto nicht gefunden.' }, { status: 401 });
    }

    const activeCampaign = await getActiveCampaign();
    if (!activeCampaign) {
      return NextResponse.json({ error: 'Aktuell läuft keine aktive FIT Campaign.' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';
    const caption = (formData.get('caption') as string) || '';
    const instagram_handle = (formData.get('instagram_handle') as string) || member.instagram || '';
    const website_consent = formData.get('website_consent') === 'true';
    const social_media_consent = formData.get('social_media_consent') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'Bitte wähle ein Foto aus.' }, { status: 400 });
    }

    if (!website_consent) {
      return NextResponse.json({ error: 'Bitte bestätige die Foto-Einwilligung für die HEAT FITS Website.' }, { status: 400 });
    }

    // Validate MIME types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      return NextResponse.json({ error: 'Ungültiges Dateiformat. Bitte JPG, PNG oder WebP hochladen.' }, { status: 400 });
    }

    // Validate file size (10 MB max)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'Das Bild ist zu groß. Maximal 10MB erlaubt.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate safe filename
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeFilename = `${uuidv4()}.${ext}`;

    let imageUrl = '';

    // Attempt upload to Supabase Storage 'fits' bucket
    try {
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('fits')
        .upload(safeFilename, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabaseAdmin.storage.from('fits').getPublicUrl(safeFilename);
        imageUrl = publicUrlData.publicUrl;
      } else {
        console.warn('Supabase storage upload error:', uploadError?.message);
      }
    } catch (storageErr) {
      console.warn('Storage exception, using public directory fallback:', storageErr);
    }

    // Fallback: save to public/uploads/fits directory
    if (!imageUrl) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'fits');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, safeFilename);
      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/fits/${safeFilename}`;
    }

    // Create entry record with moderation_status = 'pending'
    const newEntry = await createFitEntry({
      campaign_id: activeCampaign.id,
      member_id: member.id,
      image_url: imageUrl,
      title,
      caption,
      instagram_handle,
      author_name: member.first_name,
      website_consent: true,
      social_media_consent,
    });

    return NextResponse.json({
      success: true,
      entry: newEntry,
      message: 'Dein Outfit wurde erfolgreich hochgeladen und wird in Kürze von unserem Team freigeschaltet!',
    });
  } catch (err: any) {
    console.error('Fit upload error:', err);
    return NextResponse.json({ error: 'Upload fehlgeschlagen. Bitte versuche es erneut.' }, { status: 500 });
  }
}
