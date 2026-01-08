"use client";

import InfoCard from "@/app/(app)/dashboard/_components/InfoCard";
import AccountRow from "./ui/AccountRow";

export default function AccountSection({
  info,
  onEdit,
  canShowSensitive,
}: {
  info: { username: string; email: string; phone_number: string };
  onEdit: (key: "avatar" | "phone" | "password") => void;
  canShowSensitive: boolean;
}) {
  return (
    <InfoCard title="Account" align="left">
      <div className="divide-y divide-white/5">

        <AccountRow
          label="Username"
          value={info.username}
          show={canShowSensitive}
        />

        <AccountRow
          label="Email"
          value={info.email}
          show={canShowSensitive}
        />

        <AccountRow
          label="Phone Number"
          value={info.phone_number}
          show={canShowSensitive}
          onEdit={() => onEdit("phone")}
        />

        {canShowSensitive && (
          <AccountRow
            label="Password"
            value="********"
            show={true}
            onEdit={() => onEdit("password")}
          />
        )}

      </div>
    </InfoCard>
  );
}
