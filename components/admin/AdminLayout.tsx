"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminSidebar, adminAreas, adminAreaLabel } from "./AdminSidebar";
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [area, setArea] = useState("Dashboard");
  useEffect(() => {
    const sync = () =>
      setArea(decodeURIComponent(location.hash.slice(1)) || "Dashboard");
    sync();
    addEventListener("hashchange", sync);
    return () => removeEventListener("hashchange", sync);
  }, []);
  return (
    <div className="min-h-screen bg-black p-4 text-white">
      <div className="mx-auto flex max-w-7xl gap-6">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          <label className="mb-6 block text-sm lg:hidden">
            Área do CMS
            <select
              aria-label="Área do CMS"
              className="mt-2 w-full rounded-xl border border-white/20 bg-zinc-900 p-3 text-white"
              value={area}
              onChange={(event) => {
                location.hash = event.target.value;
              }}
            >
              {adminAreas.map((item) => (
                <option key={item} value={item}>
                  {adminAreaLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <Link href="/manual/manual-utilizacao-cms.html" prefetch={false} target="_blank" rel="noreferrer" className="mb-4 inline-block text-sm text-sun underline lg:hidden">Manual de utilização ↗</Link>
          {children}
        </main>
      </div>
    </div>
  );
}
