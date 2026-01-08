"use client";
import Image from "next/image";

export default function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="self-start mb-[-10]">
      <Image src="/back.svg" alt="Back" width={30} height={30} />
    </button>
  );
}
