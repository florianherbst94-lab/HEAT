import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid_token', 'https://access.heatdresden.de'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { registrationId: string, email: string };

    if (!decoded.registrationId) {
      throw new Error('Invalid token payload');
    }

    const { error } = await supabaseAdmin
      .from('pre_registrations')
      .update({ status: 'confirmed' })
      .eq('id', decoded.registrationId);

    if (error) {
      console.error('Confirmation DB Error:', error);
      return NextResponse.redirect(new URL('/?error=db_error', 'https://access.heatdresden.de'));
    }

    return NextResponse.redirect(new URL('/?confirmed=true', 'https://access.heatdresden.de'));
  } catch (error) {
    console.error('Confirmation Error:', error);
    return NextResponse.redirect(new URL('/?error=invalid_token', 'https://access.heatdresden.de'));
  }
}
