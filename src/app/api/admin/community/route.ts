import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAllMembers, deleteMember } from '@/lib/community';
import { getActiveCampaign, getPendingEntries, getAllCampaigns } from '@/lib/fits';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 401 });
    }

    const members = await getAllMembers();
    const activeCampaign = await getActiveCampaign();
    const pendingEntries = await getPendingEntries();
    const allCampaigns = await getAllCampaigns();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newMembers7d = members.filter(m => new Date(m.created_at) >= sevenDaysAgo).length;
    const whatsappOptIns = members.filter(m => m.whatsapp_opt_in).length;
    const emailOptIns = members.filter(m => m.email_marketing_opt_in).length;

    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format');

    // CSV Export
    if (format === 'csv') {
      const headers = ['Member ID', 'Vorname', 'Nachname', 'E-Mail', 'WhatsApp', 'Instagram', 'Registriert Am', 'WhatsApp Opt-In', 'Email Opt-In', 'Status'];
      const rows = members.map(m => [
        m.member_number,
        `"${m.first_name || ''}"`,
        `"${m.last_name || ''}"`,
        `"${m.email || ''}"`,
        `"${m.phone || ''}"`,
        `"${m.instagram || ''}"`,
        `"${m.created_at || ''}"`,
        m.whatsapp_opt_in ? 'JA' : 'NEIN',
        m.email_marketing_opt_in ? 'JA' : 'NEIN',
        m.status,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return new Response(csvContent, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="heat-club-members.csv"',
        },
      });
    }

    return NextResponse.json({
      kpis: {
        total_members: members.length,
        new_members_7d: newMembers7d,
        whatsapp_opt_ins: whatsappOptIns,
        email_opt_ins: emailOptIns,
        pending_outfits: pendingEntries.length,
        active_campaign_title: activeCampaign?.title || 'Keine aktive Campaign',
      },
      members,
    });
  } catch (err: any) {
    console.error('Admin community GET error:', err);
    return NextResponse.json({ error: 'Serverfehler' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const cookieStore = await cookies();
    if (cookieStore.get('admin_session')?.value !== 'authenticated') {
      return NextResponse.json({ error: 'Zugriff verweigert.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ error: 'Member ID fehlt.' }, { status: 400 });
    }

    await deleteMember(memberId);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Admin delete member error:', err);
    return NextResponse.json({ error: 'Mitglied konnte nicht gelöscht werden.' }, { status: 500 });
  }
}
