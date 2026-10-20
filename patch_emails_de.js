const fs = require('fs');

// Patch Confirm Email
const confirmPath = 'src/emails/EarlyAccessConfirmEmail.tsx';
let confirmContent = fs.readFileSync(confirmPath, 'utf8');

confirmContent = confirmContent.replace("Almost there{firstName ? `, ${firstName}` : ''}.", "Fast geschafft{firstName ? `, ${firstName}` : ''}.");
confirmContent = confirmContent.replace(
  "You are one step away from securing your early access for <strong>{eventName}</strong>. Click the link below to confirm your registration.",
  "Du bist nur noch einen Schritt davon entfernt, dir deinen Early Access für <strong>{eventName}</strong> zu sichern. Klicke auf den untenstehenden Link, um deine Registrierung zu bestätigen."
);
confirmContent = confirmContent.replace("Confirm Early Access", "Early Access Bestätigen");
confirmContent = confirmContent.replace("If you didn't request this, you can safely ignore this email.", "Wenn du dies nicht angefordert hast, kannst du diese E-Mail sicher ignorieren.");

fs.writeFileSync(confirmPath, confirmContent);

// Patch Notify Email
const notifyPath = 'src/emails/EarlyAccessNotifyEmail.tsx';
let notifyContent = fs.readFileSync(notifyPath, 'utf8');

notifyContent = notifyContent.replace("You're first{firstName ? `, ${firstName}` : ''}.", "Du bist zuerst dran{firstName ? `, ${firstName}` : ''}.");
notifyContent = notifyContent.replace(
  "Our exclusive ticket presale for <strong>{eventName}</strong> is now live. As an early access member, you get first choice.",
  "Unser exklusiver Ticket-Vorverkauf für <strong>{eventName}</strong> ist jetzt live. Als Early Access Mitglied hast du die erste Wahl."
);
notifyContent = notifyContent.replace("Event Date", "Event-Datum");
notifyContent = notifyContent.replace("Get Your Tickets", "Sichere dir deine Tickets");

fs.writeFileSync(notifyPath, notifyContent);
