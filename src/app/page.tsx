import HeroSection from '@/core/components/HeroSection';
import { PerfAuditPanel } from '@/features/audit/PerfAuditPanel';

export default function Home() {
  return (
    <div className="space-y-12">
      <HeroSection />
      <div className="container mx-auto px-4 pb-16">
        <PerfAuditPanel />
      </div>
    </div>
  );
}

