"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import InfoCard from "@/app/(app)/dashboard/_components/InfoCard"

export default function ProfileCard({
  avatar,
  username,
  email,
  onChangePhoto,
}: {
  avatar: string;
  username: string;
  email: string;
  onChangePhoto: () => void;
  btnSecondaryClass: string;
}) {
  return (
    <InfoCard title="Profile" variant="compact">
      <div className="inline-flex rounded-full ring-1 ring-white/10 p-1">
        <Image
          src={avatar}
          alt="Avatar"
          width={130}
          height={130}
          className="rounded-full object-cover border border-white/10 shadow-lg"
          priority
        />
      </div>

      <p className="mt-3 text-sm font-medium">{username}</p>
      <p className="text-xs text-white/70 mb-3">{email}</p>
      <Button 
        label="Change Photo" 
        size="md" 
        variant="secondary" 
        radius="xl" 
        onClick={onChangePhoto}>       
      </Button>
    </InfoCard>
  );
}
