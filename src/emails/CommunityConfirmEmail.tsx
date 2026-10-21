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
} from '@react-email/components';

interface Props {
  firstName?: string;
  confirmLink: string;
}

export const CommunityConfirmEmail = ({
  firstName,
  confirmLink = 'https://heatdresden.de/api/community/confirm',
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>HEAT CLUB - Bestätige deine Anmeldung</Preview>
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
                width="150" 
                height="auto" 
                alt="HEAT Logo" 
                className="mx-auto" 
              />
            </Section>

            <Heading className="text-2xl font-bold font-display text-white mb-4 uppercase tracking-widest text-center">
              Welcome to the Club{firstName ? `, ${firstName}` : ''}.
            </Heading>
            <Text className="text-heatChrome text-base leading-relaxed text-center mb-8">
              Du bist nur noch einen Schritt davon entfernt, offizielles Mitglied im HEAT CLUB zu werden. Klicke auf den untenstehenden Link, um deine E-Mail-Adresse zu bestätigen.
            </Text>

            <Section className="text-center mb-8">
              <Link
                href={confirmLink}
                className="bg-white text-heatBlack font-bold uppercase tracking-widest py-4 px-8 rounded-sm inline-block"
              >
                Anmeldung bestätigen
              </Link>
            </Section>

            <Text className="text-heatChrome text-sm text-center mb-8">
              Wenn du dies nicht angefordert hast, kannst du diese E-Mail sicher ignorieren.
            </Text>

            <Section className="text-center mt-12 border-t border-heatChromeDark pt-8">
              <Text className="text-heatChrome text-sm mb-4">
                Less website. More experience.
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

export default CommunityConfirmEmail;
