import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface Props {
  firstName?: string;
  eventName: string;
  eventDate: string;
  ticketLink: string;
}

export const EarlyAccessNotifyEmail = ({
  firstName,
  eventName = 'Heat Event',
  eventDate = 'TBA',
  ticketLink = 'https://heatdresden.de/tickets',
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>YOU'RE FIRST. HEAT TICKETS ARE LIVE.</Preview>
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
              <Text className="text-4xl font-display text-heatRed font-bold tracking-widest uppercase m-0 flex items-center justify-center gap-2">
                H<span style={{ fontSize: '1.2em' }}>♥</span>AT
              </Text>
            </Section>

            <Heading className="text-2xl font-bold font-display text-white mb-4 uppercase tracking-widest text-center">
              Du bist zuerst dran{firstName ? `, ${firstName}` : ''}.
            </Heading>
            
            <Text className="text-heatChrome text-base leading-relaxed text-center mb-6">
              Unser exklusiver Ticket-Vorverkauf für <strong>{eventName}</strong> ist jetzt live. Als Early Access Mitglied hast du die erste Wahl.
            </Text>

            <Section className="bg-heatBlack border border-heatChromeDark p-4 mb-8 text-center rounded-sm">
              <Text className="text-heatRed font-bold text-xs uppercase tracking-widest mb-1">
                Event-Datum
              </Text>
              <Text className="text-xl font-bold text-white uppercase mb-1">
                {eventDate}
              </Text>
            </Section>

            <Section className="text-center mb-8">
              <Link
                href={ticketLink}
                className="bg-white text-heatBlack font-bold uppercase tracking-widest py-4 px-8 rounded-sm inline-block shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Sichere dir deine Tickets
              </Link>
            </Section>

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

export default EarlyAccessNotifyEmail;
