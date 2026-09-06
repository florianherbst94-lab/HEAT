import { NextResponse } from 'next/server';
import { PKPass } from 'passkit-generator';
import { supabase } from '@/lib/supabase';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const resolvedParams = await params;
    const ticketId = resolvedParams.ticketId;

    if (!ticketId) {
      return NextResponse.json({ error: 'Missing ticket ID' }, { status: 400 });
    }

    // 1. Fetch ticket and event details
    const { data: orderItem, error: ticketError } = await supabase
      .from('order_items')
      .select(`
        *,
        order:orders(
            buyer_name,
            event:events(
                title,
                date,
                start_time,
                location_name,
                image_url
            )
        ),
        ticket:tickets(
            name,
            price
        )
      `)
      .eq('id', ticketId)
      .single();

    if (ticketError || !orderItem) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Safely type-cast the joined data
    const orderData = orderItem.order as unknown as { 
        buyer_name: string, 
        event: { title: string, date: string, start_time: string, location_name: string, image_url: string } 
    };
    const ticketData = orderItem.ticket as unknown as { name: string, price: number };

    // 2. Initialize passkit
    // IMPORTANT: These are placeholders. You MUST replace them with real certificates from your Apple Developer account
    const passTypeIdentifier = process.env.APPLE_WALLET_PASS_TYPE_IDENTIFIER || 'pass.com.heat-dresden.ticket';
    const teamIdentifier = process.env.APPLE_WALLET_TEAM_IDENTIFIER || 'YOUR_TEAM_ID';
    const certPem = process.env.APPLE_WALLET_CERT_PEM || '--- DUMMY CERT ---';
    const certKey = process.env.APPLE_WALLET_CERT_KEY || '--- DUMMY KEY ---';
    const certKeyPassphrase = process.env.APPLE_WALLET_CERT_KEY_PASSPHRASE || '';
    const wwdrPem = process.env.APPLE_WALLET_WWDR_PEM || '--- DUMMY WWDR ---';

    // Create the pass
    const pass = new PKPass({
        'pass.json': Buffer.from(JSON.stringify({
            formatVersion: 1,
            passTypeIdentifier: passTypeIdentifier,
            serialNumber: ticketId,
            teamIdentifier: teamIdentifier,
            organizationName: 'Heat Dresden',
            description: `Ticket for ${orderData.event.title}`,
            logoText: 'Heat Dresden',
            foregroundColor: 'rgb(255, 255, 255)',
            backgroundColor: 'rgb(0, 0, 0)',
            labelColor: 'rgb(255, 255, 255)',
            eventTicket: {
                primaryFields: [
                    {
                        key: 'event',
                        label: 'EVENT',
                        value: orderData.event.title
                    }
                ],
                secondaryFields: [
                    {
                        key: 'date',
                        label: 'DATE',
                        value: orderData.event.date
                    },
                    {
                        key: 'location',
                        label: 'LOCATION',
                        value: orderData.event.location_name
                    }
                ],
                auxiliaryFields: [
                    {
                        key: 'ticketType',
                        label: 'TICKET TYPE',
                        value: ticketData.name
                    },
                    {
                        key: 'buyer',
                        label: 'ATTENDEE',
                        value: orderData.buyer_name
                    }
                ],
                backFields: [
                    {
                        key: 'terms',
                        label: 'TERMS & CONDITIONS',
                        value: 'Valid for one entry. Non-refundable.'
                    }
                ]
            },
            barcode: {
                message: orderItem.qr_code,
                format: 'PKBarcodeFormatQR',
                messageEncoding: 'iso-8859-1'
            }
        })),
        // Normally you would add images here (icon.png, logo.png, etc)
        // 'icon.png': fs.readFileSync('path/to/icon.png'),
    }, {
        wwdr: wwdrPem,
        signerCert: certPem,
        signerKey: certKey,
        signerKeyPassphrase: certKeyPassphrase,
    });

    // Generate the pass buffer
    const passBuffer = await pass.getAsBuffer();

    // 3. Return the .pkpass file
    const headers = new Headers();
    headers.set('Content-Type', 'application/vnd.apple.pkpass');
    headers.set('Content-Disposition', `attachment; filename="${orderData.event.title.replace(/\s+/g, '_')}_Ticket.pkpass"`);

    return new NextResponse(passBuffer as unknown as BodyInit, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('Error generating Apple Wallet pass:', error);
    // If certificates are invalid (which they will be initially), we return a 500
    return NextResponse.json(
      { error: 'Failed to generate Apple Wallet pass. Have you configured your Apple Developer certificates?' },
      { status: 500 }
    );
  }
}
