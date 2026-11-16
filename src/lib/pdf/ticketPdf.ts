import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export async function generateTicketPDF(
  eventName: string,
  eventDate: string,
  buyerName: string,
  ticketCategory: string,
  ticketId: string, // The HEAT-... UUID
  locationName: string = '',
  city: string = '',
  imageUrl: string = ''
): Promise<Buffer> {
  // Create a new PDFDocument
  const pdfDoc = await PDFDocument.create();
  
  // Add a page (A4, portrait)
  const page = pdfDoc.addPage([595.28, 841.89]); 
  const { width, height } = page.getSize();
  
  // Embed fonts
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Background Color (Dark Theme like Heat)
  page.drawRectangle({
    x: 0,
    y: 0,
    width: width,
    height: height,
    color: rgb(0.07, 0.07, 0.07), // bg-heat-anthracite #111111 roughly
  });

  // 1. Draw Event Image Header
  if (imageUrl) {
    try {
      // Use standard fetch (works in Next.js environment)
      const imgRes = await fetch(imageUrl);
      if (imgRes.ok) {
        const imgBuffer = await imgRes.arrayBuffer();
        let embeddedImage;
        if (imageUrl.toLowerCase().endsWith('.png')) {
          embeddedImage = await pdfDoc.embedPng(imgBuffer);
        } else {
          embeddedImage = await pdfDoc.embedJpg(imgBuffer);
        }
        
        // Calculate dimensions to cover the top area
        const imgWidth = width;
        const imgHeight = 250;
        
        page.drawImage(embeddedImage, {
          x: 0,
          y: height - imgHeight,
          width: imgWidth,
          height: imgHeight,
          opacity: 0.8,
        });

        // Add a dark gradient/fade effect at the bottom of the image
        page.drawRectangle({
          x: 0,
          y: height - imgHeight,
          width: imgWidth,
          height: 50,
          color: rgb(0.07, 0.07, 0.07),
          opacity: 0.7,
        });
      }
    } catch (e) {
      console.error('Failed to load event image for PDF', e);
    }
  } else {
    // Fallback red header
    page.drawRectangle({
      x: 0,
      y: height - 150,
      width: width,
      height: 150,
      color: rgb(0.8, 0, 0), // Heat red
    });
  }

  // 2. Add HEAT Logo at the top center
  try {
    // Using an absolute URL from env, or a fallback URL if not set
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://heat-dresden.de';
    const logoRes = await fetch(`${baseUrl}/media/logo.png`);
    if (logoRes.ok) {
      const logoBuffer = await logoRes.arrayBuffer();
      const logoImg = await pdfDoc.embedPng(logoBuffer);
      const logoDims = logoImg.scale(0.3); // Scale down
      
      page.drawImage(logoImg, {
        x: width / 2 - logoDims.width / 2,
        y: height - 80,
        width: logoDims.width,
        height: logoDims.height,
      });
    } else {
      // Fallback text if logo fails to load
      page.drawText('H E A T', {
        x: width / 2 - 50,
        y: height - 80,
        size: 28,
        font: timesRomanBoldFont,
        color: rgb(1, 1, 1),
      });
    }
  } catch (e) {
    console.error('Failed to load logo for PDF', e);
  }

  // Generate QR Code as PNG Buffer
  const qrCodeDataUrl = await QRCode.toDataURL(ticketId, {
    width: 400,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
  
  const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrCodeBuffer = Buffer.from(base64Data, 'base64');
  const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
  const qrDims = qrImage.scale(0.4); // 400 * 0.4 = 160px width
  
  // --- TICKET INFO SECTION ---
  
  const contentStartY = height - 280;

  // Title
  page.drawText(eventName.toUpperCase(), {
    x: 50,
    y: contentStartY,
    size: 28,
    font: timesRomanBoldFont,
    color: rgb(1, 1, 1),
  });

  // Ticket Name
  page.drawText(ticketCategory.toUpperCase(), {
    x: 50,
    y: contentStartY - 30,
    size: 16,
    font: helveticaBoldFont,
    color: rgb(1, 0.16, 0.16), // Heat Red
  });

  // Details Grid
  const leftColX = 50;
  const rightColX = 250;
  
  const drawLabel = (text: string, x: number, y: number) => {
    page.drawText(text.toUpperCase(), {
      x, y, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5), letterSpacing: 2
    });
  };

  const drawValue = (text: string, x: number, y: number) => {
    page.drawText(text, {
      x, y, size: 14, font: helveticaBoldFont, color: rgb(1, 1, 1)
    });
  };

  // Date
  drawLabel('Date', leftColX, contentStartY - 80);
  drawValue(eventDate, leftColX, contentStartY - 95);

  // Location
  drawLabel('Location', rightColX, contentStartY - 80);
  const locStr = locationName ? `${locationName}${city ? `, ${city}` : ''}` : 'TBA';
  drawValue(locStr, rightColX, contentStartY - 95);

  // Buyer
  drawLabel('Ticket Holder', leftColX, contentStartY - 140);
  drawValue(buyerName.toUpperCase(), leftColX, contentStartY - 155);

  // --- QR CODE SECTION (Centered) ---
  
  const qrY = contentStartY - 350;
  const qrX = width / 2 - qrDims.width / 2;

  // Draw white background for QR
  page.drawRectangle({
    x: qrX - 10,
    y: qrY - 10,
    width: qrDims.width + 20,
    height: qrDims.height + 20,
    color: rgb(1, 1, 1),
  });
  
  page.drawImage(qrImage, {
    x: qrX,
    y: qrY,
    width: qrDims.width,
    height: qrDims.height,
  });

  // Ticket ID String
  page.drawText(ticketId.toUpperCase(), {
    x: width / 2 - (ticketId.length * 3), // rough centering
    y: qrY - 30,
    size: 10,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
    letterSpacing: 3,
  });

  // Footer / Rules
  const footerY = 100;
  
  page.drawLine({
    start: { x: 50, y: footerY + 30 },
    end: { x: width - 50, y: footerY + 30 },
    thickness: 1,
    color: rgb(0.2, 0.2, 0.2), // Dark gray dashed line replacement
  });

  page.drawText('RULES', {
    x: 50,
    y: footerY,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(1, 1, 1),
    letterSpacing: 2,
  });

  page.drawText('- Please have this ticket ready on your phone or printed.', {
    x: 50,
    y: footerY - 25,
    size: 9,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText('- Dress up. Show up. Bring the heat.', {
    x: 50,
    y: footerY - 40,
    size: 9,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });
  page.drawText('- This ticket is only valid for one person and will be scanned at the door.', {
    x: 50,
    y: footerY - 55,
    size: 9,
    font: helveticaFont,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Serialize to Buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
