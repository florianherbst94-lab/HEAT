'use client';

import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  className?: string;
}

export default function QRCodeGenerator({ value, size = 256, className = '' }: QRCodeGeneratorProps) {
  return (
    <div className={`p-4 bg-white rounded-md inline-block ${className}`}>
      <QRCodeCanvas 
        value={value} 
        size={size} 
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"H"}
        includeMargin={false}
        imageSettings={{
          src: "/media/logo.png",
          x: undefined,
          y: undefined,
          height: 24,
          width: 24,
          excavate: true,
        }}
      />
    </div>
  );
}
