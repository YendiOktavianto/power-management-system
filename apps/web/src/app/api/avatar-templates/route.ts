import { NextResponse } from "next/server";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";  

const SUPPORTED = new Set([".png", ".jpg", ".jpeg", ".svg", ".webp"]);

async function readDirSafe(abs: string) {
  try {
    return await readdir(abs, { withFileTypes: true });
  } catch {
    return [];
  }
}

export async function GET() {
  const root = process.cwd();
  const folders = ["profile", "profile2"] as const;
  const items: { url: string; label: string; group: string }[] = [];

  for (const group of folders) {
    const abs = path.join(root, "public", group);
    const entries = await readDirSafe(abs);
    for (const e of entries) {
      if (!e.isFile()) continue;
      const ext = path.extname(e.name).toLowerCase();
      if (!SUPPORTED.has(ext)) continue;
      const url = `/${group}/${e.name}`;
      items.push({
        url,
        label: e.name.replace(ext, ""),
        group,
      });
    }
  }

  items.sort(
    (a, b) =>
      a.group.localeCompare(b.group) ||
      a.label.localeCompare(b.label, undefined, { numeric: true })
  );

  return NextResponse.json({ items });
}
