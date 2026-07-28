'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function MobileMenu({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button aria-label="Abrir menu" onClick={() => setOpen(true)}>
        <Menu />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/95 p-6">
          <button
            aria-label="Fechar menu"
            className="float-right"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>

          <nav className="mt-16 grid gap-5 text-xl">
            {links.map((link) =>
              link.href === '/fiti' ? (
                <Link
                  onClick={() => setOpen(false)}
                  key={link.href}
                  href={link.href}
                  className="w-fit rounded-full bg-sun px-6 py-3 font-extrabold tracking-wide text-black shadow-lg shadow-yellow-400/30 ring-2 ring-yellow-200/70"
                >
                  ★ {link.label}
                </Link>
              ) : (
                <Link
                  onClick={() => setOpen(false)}
                  key={link.href}
                  href={link.href}
                >
                  {link.label}
                </Link>
              ),
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
