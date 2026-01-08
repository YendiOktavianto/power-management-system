"use client";

import React from "react";
import Image from "next/image";

export default function LogoTitle({
  logoPath,
  title,
}: {
  logoPath: string;
  title: string;
}) {
  return (
    <>
      <Image
        src={logoPath}
        alt="Logout Icon"
        width={100}
        height={100}
        className="mb-2 mx-auto"
      />
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
    </>
  );
}
