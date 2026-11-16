import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export async function generateTicketPDF(
  eventName: string,
  eventDate: string,
  buyerName: string,
  ticketCategory: string,
  ticketId: string // The HEAT-... UUID
): Promise<Buffer> {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  
  // Add a page
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 Size in points
  const { width, height } = page.getSize();
  
  // Embed fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Background Color (Dark Theme like Heat)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: rgb(0.05, 0.05, 0.05), // bg-heat-black #0D0D0D roughly
  });

  // Generate QR Code as PNG Buffer
  const qrCodeDataUrl = await QRCode.toDataURL(ticketId, {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  // Convert Data URL to Uint8Array
  const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrCodeBuffer = Buffer.from(base64Data, 'base64');
  
  const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
  const qrDims = qrImage.scale(0.8);
  
  // Header / Logo area
  page.drawText('H E A T', {
    x: width / 2 - 50,
    y: height - 100,
    size: 32,
    font: timesRomanBoldFont,
    color: rgb(1, 1, 1), // White
  });

  // Event Name
  page.drawText(eventName.toUpperCase(), {
    x: 50,
    y: height - 200,
    size: 24,
    font: timesRomanBoldFont,
    color: rgb(1, 1, 1),
  });

  // Event Date
  page.drawText(`DATE: ${eventDate}`, {
    x: 50,
    y: height - 230,
    size: 14,
    font: helveticaFont,
    color: rgb(0.8, 0.8, 0.8), // Light gray
  });

  // Buyer Info
  page.drawText(`TICKET HOLDER:`, {
    x: 50,
    y: height - 280,
    size: 12,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText(buyerName.toUpperCase(), {
    x: 50,
    y: height - 300,
    size: 16,
    font: timesRomanBoldFont,
    color: rgb(1, 1, 1),
  });

  // Ticket Category
  page.drawText(`CATEGORY:`, {
    x: 50,
    y: height - 340,
    size: 12,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });
  
  page.drawText(ticketCategory.toUpperCase(), {
    x: 50,
    y: height - 360,
    size: 16,
    font: timesRomanBoldFont,
    color: rgb(0.9, 0, 0), // Heat Red (approx)
  });

  // QR Code
  const qrX = width - qrDims.width - 50;
  const qrY = height - qrDims.height - 200;
  
  // Draw white background for QR
  page.drawRectangle({
    x: qrX - 5,
    y: qrY - 5,
    width: qrDims.width + 10,
    height: qrDims.height + 10,
    color: rgb(1, 1, 1),
  });
  
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrDims.width,
    height: qrDims.height,
  });

  // Ticket ID String
  page.drawText(ticketId, {
    x: qrX,
    y: qrY - 20,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Footer / Rules
  page.drawText('RULES', {
    x: 50,
    y: 150,
    size: 14,
    font: timesRomanBoldFont,
    color: rgb(1, 1, 1),
  });

  page.drawText('- Please have this ticket ready on your phone or printed.', {
    x: 50,
    y: 120,
    size: 10,
    font: helveticaFont,
    color: rgb(0.7, 0.7, 0.7),
  });
  page.drawText('- Dress up. Show up. Bring the heat.', {
    x: 50,
    y: 100,
    size: 10,
    font: helveticaFont,
    color: rgb(0.7, 0.7, 0.7),
  });
  page.drawText('- This ticket is only valid for one person and will be scanned at the door.', {
    x: 50,
    y: 80,
    size: 10,
    font: helveticaFont,
    color: rgb(0.7, 0.7, 0.7),
  });

  // Serialize to Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
