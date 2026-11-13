import { QrCode } from 'lucide-react';
import PageHeader from '../../components/navigation/PageHeader';
import DigitalPassPanel from '../components/DigitalPassPanel';

export default function MyQR() {
  return (
    <>
      <PageHeader
        icon={QrCode}
        title="My QR Pass"
        subtitle="Show this to the organizer to record your attendance."
      />
      <div className="flex justify-center">
        <DigitalPassPanel />
      </div>
    </>
  );
}
