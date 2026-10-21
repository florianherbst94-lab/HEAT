import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/de/community?error=invalid_token', 'https://heatdresden.de'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { memberId: string, email: string };
    
    // Check member
    const { data: member } = await supabaseAdmin
      .from('heat_members')
      .select('*')
      .eq('id', decoded.memberId)
      .single();

    if (!member) {
      return NextResponse.redirect(new URL('/de/community?error=invalid_token', 'https://heatdresden.de'));
    }

    if (member.status === 'active') {
      const cookieStore = await cookies();
      cookieStore.set('heat_member_token', member.session_token || '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 365 * 24 * 60 * 60, // 1 year
      });
      return NextResponse.redirect(new URL('/de/community?confirmed=true', 'https://heatdresden.de'));
    }

    // Activate member
    const { data: updatedMember, error: updateError } = await supabaseAdmin
      .from('heat_members')
      .update({
        status: 'active',
        email_verified_at: new Date().toISOString()
      })
      .eq('id', decoded.memberId)
      .select()
      .single();

    if (updateError || !updatedMember) {
      return NextResponse.redirect(new URL('/de/community?error=db_error', 'https://heatdresden.de'));
    }

    // Login user
    const cookieStore = await cookies();
    cookieStore.set('heat_member_token', updatedMember.session_token || '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    return NextResponse.redirect(new URL('/de/community?confirmed=true', 'https://heatdresden.de'));
    
  } catch (error) {
    console.error('Confirm token error:', error);
    return NextResponse.redirect(new URL('/de/community?error=invalid_token', 'https://heatdresden.de'));
  }
}
