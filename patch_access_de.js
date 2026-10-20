const fs = require('fs');

const filePath = 'src/app/[locale]/access/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Texts to translate
content = content.replace('The First Chapter', 'The First Chapter'); // Keep as is since it's a brand claim
content = content.replace('Feel the<br/>Heat.', 'Feel the<br/>Heat.'); // Brand claim
content = content.replace('Be first. Get exclusive access to our lowest ticket prices before the official release.', 'Sei der Erste. Erhalte exklusiven Zugang zu unseren günstigsten Ticketpreisen vor dem offiziellen Vorverkaufsstart.');
content = content.replace('Get Early Access', 'Early Access Sichern');
content = content.replace('Register now and unlock exclusive first-release ticket access.', 'Registriere dich jetzt und schalte den exklusiven First-Release Ticketzugang frei.');

// Form
content = content.replace('E-Mail Address *', 'E-Mail-Adresse *');
content = content.replace('First Name (Optional)', 'Vorname (Optional)');
content = content.replace('I agree to receive ticket information and event updates. I can unsubscribe at any time.', 'Ich bin damit einverstanden, Ticketinformationen und Event-Updates zu erhalten. Ich kann mich jederzeit abmelden.');
content = content.replace('Privacy Policy', 'Datenschutzerklärung');
content = content.replace('Please provide a valid email address.', 'Bitte gib eine gültige E-Mail-Adresse ein.');
content = content.replace('Please accept the privacy policy to continue.', 'Bitte akzeptiere die Datenschutzerklärung, um fortzufahren.');
content = content.replace('Processing...', 'Wird verarbeitet...');
content = content.replace('Unlock Early Access', 'Early Access Freischalten');
content = content.replace('Limited first-release tickets. Early access members get notified first.', 'Limitierte First-Release Tickets. Early Access Mitglieder werden als Erste benachrichtigt.');
content = content.replace('Registration failed. Please try again.', 'Registrierung fehlgeschlagen. Bitte versuche es erneut.');
content = content.replace('A network error occurred. Please try again.', 'Ein Netzwerkfehler ist aufgetreten. Bitte versuche es erneut.');

// Success State
content = content.replace('One Step Closer<br />To The Heat.', 'Noch ein Schritt<br />bis zur Heat.');
content = content.replace('Check your inbox and confirm your email to secure your early access.', 'Überprüfe deinen Posteingang und bestätige deine E-Mail, um deinen Early Access zu sichern.');

// Confirmed State
content = content.replace("You're On The List.", 'Du stehst auf der Liste.');
content = content.replace("You'll be among the first to know when our exclusive ticket presale begins.", 'Du gehörst zu den Ersten, die erfahren, wann unser exklusiver Ticket-Vorverkauf beginnt.');
content = content.replace('Link copied!', 'Link kopiert!');
content = content.replace('Share', 'Teilen');

fs.writeFileSync(filePath, content);
