import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleAuth } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';

// Note: Requires a Google Cloud Service Account JSON key
// For development, these are dummy values
const credentials = {
  client_email: process.env.GOOGLE_WALLET_CLIENT_EMAIL || 'dummy@dummy.iam.gserviceaccount.com',
  private_key: (process.env.GOOGLE_WALLET_PRIVATE_KEY || '-----BEGIN PRIVATE KEY-----\nMIIEvwIBAD...\n-----END PRIVATE KEY-----\n').replace(/\\n/g, '\n'),
};

const ISSUER_ID = process.env.GOOGLE_WALLET_ISSUER_ID || 'DUMMY_ISSUER_ID';
const CLASS_ID = process.env.GOOGLE_WALLET_CLASS_ID || 'DUMMY_CLASS_ID';

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

    // 2. Build the Google Wallet Object
    const objectId = `${ISSUER_ID}.${ticketId}`;

    const newObject = {
        id: objectId,
        classId: `${ISSUER_ID}.${CLASS_ID}`,
        state: 'ACTIVE',
        heroImage: {
          sourceUri: {
            uri: orderData.event.image_url || 'https://images.unsplash.com/photo-1540039155733-d7694752e53f'
          }
        },
        textModulesData: [
          {
            header: 'Ticket Type',
            body: ticketData.name,
            id: 'ticket_type'
          },
          {
            header: 'Attendee',
            body: orderData.buyer_name,
            id: 'attendee_name'
          }
        ],
        barcode: {
          type: 'QR_CODE',
          value: orderItem.qr_code,
          alternateText: ticketId.substring(0, 8) // Show short ID below barcode
        },
        locations: [
          {
            latitude: 51.0504, // Default to Dresden coords if geocoding isn't available
            longitude: 13.7373
          }
        ],
        // EventTicket specific fields
        seatInfo: {
            seat: {
                defaultValue: {
                    language: 'en',
                    value: 'General Admission'
                }
            }
        }
    };

    // 3. Create the JWT
    const claims = {
      iss: credentials.client_email,
      aud: 'google',
      origins: ['www.google.com'],
      typ: 'savetowallet',
      payload: {
        eventTicketObjects: [newObject]
      }
    };

    const token = jwt.sign(claims, credentials.private_key, { algorithm: 'RS256' });
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;

    // 4. Redirect to the Save to Google Pay URL
    return NextResponse.redirect(saveUrl);

  } catch (error: any) {
    console.error('Error generating Google Wallet link:', error);
    return NextResponse.json(
      { error: 'Failed to generate Google Wallet link. Have you configured your Google Service Account keys?' },
      { status: 500 }
    );
  }
}
