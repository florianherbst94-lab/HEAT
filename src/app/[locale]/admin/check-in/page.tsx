'use client';

import { useState } from 'react';
import QRScanner from '@/components/admin/QRScanner';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { Link } from '@/i18n/routing';
import AdminGuard from '@/components/admin/AdminGuard';

export default function CheckInPage() {
  const [scanResult, setScanResult] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [scannedData, setScannedData] = useState<string>('');

  const handleScanSuccess = (decodedText: string) => {
    setScannedData(decodedText);
    
    // Mock Validation Logic: Valid if it starts with 'HEAT-'
    if (decodedText.startsWith('HEAT-')) {
      setScanResult('valid');
      // Here we would normally call a Supabase function to mark the ticket as scanned
    } else {
      setScanResult('invalid');
    }
  };

  const handleScanError = (error: unknown) => {
    // Ignore frequent scan errors (like "no QR code found in frame")
    // console.log(error);
  };

  const resetScanner = () => {
    setScanResult('idle');
    setScannedData('');
    // Forcing a remount of the QRScanner to reset its internal state cleanly
  };

  return (
    <AdminGuard>
      <main className="min-h-screen bg-heat-black pb-24 pt-20">
        <div className="container mx-auto px-4 max-w-lg">
          
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-widest text-white uppercase">
                Door Check-in
              </h1>
              <p className="text-heat-chrome text-xs">Scan Tickets & Guestlist</p>
            </div>
            <Link 
              href="/admin"
              className="text-heat-chrome hover:text-white text-xs border border-heat-chrome-dark px-3 py-1.5 rounded-sm"
            >
              Dashboard
            </Link>
          </div>

          {scanResult === 'idle' && (
            <div className="space-y-6">
              <div className="bg-heat-anthracite p-4 border border-heat-chrome-dark text-center rounded-sm">
                <p className="text-heat-chrome-light text-sm mb-2">Align the QR code within the frame</p>
                <QRScanner 
                  onScanSuccess={handleScanSuccess} 
                  onScanError={handleScanError} 
                />
              </div>
              
              <div className="p-4 bg-heat-anthracite/30 border border-heat-chrome-dark rounded-sm">
                <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-2">Manual Entry</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ticket ID (e.g. HEAT-123)"
                    className="w-full bg-heat-black border border-heat-chrome-dark p-3 text-white focus:outline-none focus:border-heat-chrome"
                  />
                  <button className="bg-heat-chrome text-heat-black font-bold uppercase tracking-wider text-xs px-4">
                    Check
                  </button>
                </div>
              </div>
            </div>
          )}

          {scanResult === 'valid' && (
            <div className="bg-green-500/10 border border-green-500 rounded-sm p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center mb-6">
                <CheckCircle2 className="w-24 h-24 text-green-500" />
              </div>
              <h2 className="font-display text-3xl font-bold text-green-500 uppercase tracking-widest mb-2">
                Valid Entry
              </h2>
              <p className="text-white text-lg mb-1">{scannedData}</p>
              <p className="text-green-500/70 text-sm mb-8">Standard Ticket • 1 Person</p>
              
              <button 
                onClick={resetScanner}
                className="w-full py-4 bg-green-500 text-black font-bold uppercase tracking-wider text-sm hover:bg-green-400 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Next Scan
              </button>
            </div>
          )}

          {scanResult === 'invalid' && (
            <div className="bg-red-500/10 border border-red-500 rounded-sm p-8 text-center animate-in fade-in zoom-in duration-300">
              <div className="flex justify-center mb-6">
                <XCircle className="w-24 h-24 text-red-500" />
              </div>
              <h2 className="font-display text-3xl font-bold text-red-500 uppercase tracking-widest mb-2">
                Invalid Ticket
              </h2>
              <p className="text-white text-sm mb-1">{scannedData}</p>
              <p className="text-red-500/70 text-xs mb-8">Code not found or already scanned.</p>
              
              <button 
                onClick={resetScanner}
                className="w-full py-4 border border-red-500 text-red-500 font-bold uppercase tracking-wider text-sm hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          )}

        </div>
      </main>
    </AdminGuard>
  );
}
