import { QRCodeSVG } from 'qrcode.react';

/** Scannable QR code in the royal purple theme. Size it with className (e.g. "h-28 w-28"). */
export default function QRCode({ value, className = 'h-28 w-28', title = 'Verification QR code' }) {
  return (
    <div className={className}>
      <QRCodeSVG
        value={value}
        size={256}
        level="M"
        fgColor="#2B0B4E"
        bgColor="#FFFFFF"
        title={title}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
