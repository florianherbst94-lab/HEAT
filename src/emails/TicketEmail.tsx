import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from '@react-email/components';

interface TicketEmailProps {
  buyerName: string;
  eventName: string;
  eventDate: string;
  tickets: Array<{
    category: string;
    qrCodeUrl: string; // Base64 Data URL or public image URL
    ticketId: string;
  }>;
}

export const TicketEmail = ({
  buyerName = 'Heat Member',
  eventName = 'Heat Night',
  eventDate = '05.07.2024',
  tickets = [],
}: TicketEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Dein Ticket für {eventName} - Dress up. Show up. Feel the Heat.</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                heatRed: '#ff2a2a',
                heatBlack: '#0a0a0a',
                heatAnthracite: '#111111',
                heatChrome: '#8b8b8b',
                heatChromeDark: '#2c2c2c',
              },
              fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Playfair Display', 'serif'],
              },
            },
          },
        }}
      >
        <Body className="bg-heatBlack text-white font-sans m-0 p-4">
          <Container className="bg-heatAnthracite border border-heatChromeDark p-6 mx-auto max-w-[600px] mt-8 mb-8 rounded-sm">
            <Section className="text-center mb-8 border-b border-heatChromeDark pb-6">
              <Img
                src="https://heatdresden.de/media/logo.png"
                width="120"
                height="auto"
                alt="HEAT"
                className="mx-auto"
              />
            </Section>

            <Heading className="text-2xl font-bold font-display text-white mb-4 uppercase tracking-widest text-center">
              See you there, {buyerName}!
            </Heading>
            <Text className="text-heatChrome text-base leading-relaxed text-center mb-8">
              Hier sind deine Tickets für das kommende Heat Event. Bitte halte den QR Code am Eingang bereit.
            </Text>

            <Section className="bg-heatBlack border border-heatChromeDark p-4 mb-8 text-center rounded-sm">
              <Text className="text-heatRed font-bold text-xs uppercase tracking-widest mb-1">
                Event
              </Text>
              <Text className="text-xl font-bold text-white uppercase mb-1">
                {eventName}
              </Text>
              <Text className="text-heatChrome text-sm">
                {eventDate}
              </Text>
            </Section>

            {tickets.map((ticket, index) => (
              <Section key={index} className="bg-heatBlack border border-heatRed/50 p-6 mb-6 rounded-sm text-center relative overflow-hidden">
                <Text className="text-xs text-heatChrome uppercase tracking-wider mb-1">Ticket {index + 1}</Text>
                <Text className="text-lg font-bold text-white uppercase tracking-widest mb-6">{ticket.category}</Text>
                
                <div className="bg-white p-4 inline-block rounded-sm mb-4">
                  <Img src={ticket.qrCodeUrl} width="150" height="150" alt={`QR Code for ticket ${ticket.ticketId}`} className="mx-auto" />
                </div>
                
                <Text className="text-heatChromeDark text-[10px] uppercase tracking-widest">
                  ID: {ticket.ticketId}
                </Text>
              </Section>
            ))}

            <Section className="text-center mt-12 border-t border-heatChromeDark pt-8">
              <Text className="text-heatChrome text-sm mb-4">
                Dress up. Show up. Feel the Heat.
              </Text>
              <Link href="https://heatdresden.de" className="text-heatRed text-sm font-bold uppercase tracking-wider">
                heatdresden.de
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TicketEmail;
