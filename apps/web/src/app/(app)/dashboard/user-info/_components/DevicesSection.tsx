"use client";

import Button from "@/components/ui/Button";
import InfoCard from "@/app/(app)/dashboard/_components/InfoCard"

export default function DevicesSection({ onAddDevice }: { onAddDevice: () => void }) {
  return (
    <InfoCard title="Account" align="left">
      <div className="mt-2">
        <Button label="+ Add Device" size="md" variant="secondary" radius="xl" onClick={onAddDevice}>
        </Button>
      </div>
    </InfoCard>
  );
}
