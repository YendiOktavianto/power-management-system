"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { API_USER_INFO } from "@/app/(app)/dashboard/user-info/constants";
import { authHeaders } from "@/app/(app)/dashboard/user-info/validation";

type UserInfoDTO = {
  username?: string;
  email?: string;
  phoneNumber?: string | null;
  profileImg?: string | null;
};

export default function ProfileAvatar() {
  const router = useRouter();
  const [avatar, setAvatar] = useState<string>("/profile.svg");

  // 1) Fetch awal dari API_USER_INFO
  useEffect(() => {
    let ignore = false;

    async function loadAvatar() {
      try {
        const res = await fetch(API_USER_INFO, {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          cache: "no-store",
        });

        if (!res.ok) return;

        const data: UserInfoDTO = await res.json();
        if (ignore) return;

        setAvatar(data.profileImg || "/profile.svg");
      } catch {
        // kalau error, biarin aja pakai default /profile.svg
      }
    }

    void loadAvatar();

    return () => {
      ignore = true;
    };
  }, []);

  // 2) Dengerin event avatar:changed dari user-info
  useEffect(() => {
    function handleAvatarChanged(e: Event) {
      const evt = e as CustomEvent<{ url?: string }>;
      const url = evt.detail?.url;
      if (typeof url === "string" && url.trim() !== "") {
        setAvatar(url);
      }
    }

    if (typeof window !== "undefined") {
      window.addEventListener("avatar:changed", handleAvatarChanged);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("avatar:changed", handleAvatarChanged);
      }
    };
  }, []);

  const handleProfileRedirect = () => router.push("/dashboard/user-info");

  return (
    <div className="ml-3">
      <button
        type="button"
        onClick={handleProfileRedirect}
        className="rounded-full border-2 border-blue-500 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400/60"
        aria-label="Open profile page"
      >
        <Image
          src={avatar}
          alt="Profile"
          width={30}
          height={30}
          className="rounded-full object-cover"
        />
      </button>
    </div>
  );
}
