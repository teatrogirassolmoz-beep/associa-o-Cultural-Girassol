export type MemberProfile = {
  name: string;
  role: string;
  group: "associacao" | "fiti";
  bio: string;
  photo: string;
};
export type Announcement = { label: string; href: string };
export const defaultAnnouncements: Announcement[] = [
  {
    label: "FITI · Conheça as modalidades de candidatura",
    href: "/fiti#formularios",
  },
  {
    label: "Teatro, formação e encontros · Explore o programa",
    href: "/fiti#programacao",
  },
  { label: "Girassol · Descubra os nossos projectos", href: "/#projectos" },
];
export function readList<T>(value: unknown, fallback: T[] = []): T[] {
  if (value === undefined || value === null || value === "") return fallback;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
export function safePublicHref(value: unknown): string {
  if (typeof value !== "string" || /[\u0000-\u001f\u007f\\]/.test(value))
    return "";
  if (
    (value.startsWith("/") &&
      !value.startsWith("//") &&
      !value.includes("\\")) ||
    value.startsWith("#")
  )
    return value;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}
export function memberProfiles(value: unknown): MemberProfile[] {
  return readList<Partial<MemberProfile> | null>(value).flatMap((item) => {
    if (!item || typeof item.name !== "string" || !item.name.trim()) return [];
    return [
      {
        name: item.name.trim(),
        role: typeof item.role === "string" ? item.role : "",
        group:
          item.group === "fiti" ? ("fiti" as const) : ("associacao" as const),
        bio: typeof item.bio === "string" ? item.bio : "",
        photo: safePublicHref(item.photo),
      },
    ];
  });
}
export function announcements(value: unknown): Announcement[] {
  return readList<Partial<Announcement> | null>(
    value,
    defaultAnnouncements,
  ).flatMap((item) => {
    const href = safePublicHref(item?.href);
    return item && typeof item.label === "string" && item.label.trim() && href
      ? [{ label: item.label.trim(), href }]
      : [];
  });
}
