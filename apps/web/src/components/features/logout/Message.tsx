"use client";

import React from "react";

export default function Message({ text }: { text: string }) {
  return <p className="mb-6 text-sm text-center">{text}</p>;
}
