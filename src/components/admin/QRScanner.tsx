'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: unknown) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    // Initialize scanner only on the client side
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false
      );

      scannerRef.current.render(
        (decodedText) => {
          if (isScanning) {
            setIsScanning(false);
            // Pause scanning visually and stop callbacks
            scannerRef.current?.pause(true);
            onScanSuccess(decodedText);
          }
        },
        (error) => {
          if (onScanError && isScanning) {
            onScanError(error);
          }
        }
      );
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [onScanSuccess, onScanError, isScanning]);

  // Method to resume scanning (can be exposed via ref if needed, or controlled via props)
  useEffect(() => {
    if (isScanning && scannerRef.current && scannerRef.current.getState() === 3 /* PAUSED */) {
      scannerRef.current.resume();
    }
  }, [isScanning]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-sm border border-heat-chrome-dark">
      <div id="qr-reader" className="w-full bg-heat-black" />
      <style jsx global>{`
        /* Overriding html5-qrcode default styles for a dark theme look */
        #qr-reader {
          border: none !important;
        }
        #qr-reader__scan_region {
          background-color: #0c0c0c !important;
        }
        #qr-reader__dashboard_section_csr span,
        #qr-reader__dashboard_section_swaplink {
          color: #a8a8a8 !important;
        }
        #qr-reader button {
          background-color: #1a1a1a !important;
          color: #ffffff !important;
          border: 1px solid #333333 !important;
          padding: 8px 16px !important;
          border-radius: 2px !important;
          cursor: pointer !important;
          margin: 4px !important;
          font-family: inherit !important;
          text-transform: uppercase !important;
          font-size: 12px !important;
          letter-spacing: 0.05em !important;
        }
        #qr-reader button:hover {
          background-color: #333333 !important;
        }
      `}</style>
    </div>
  );
}
