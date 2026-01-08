"use client";
import Image from "next/image";
import React from "react";

export default function ProfileAvatar() {
  return (
    <div className="ml-3">
      <Image
        src="/profile.svg"
        alt="Profile"
        width={30}
        height={30}
        className="rounded-full border-2 border-blue-500"
      />
    </div>
  );
}
