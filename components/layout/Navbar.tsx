'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GirassolLogo } from '@/components/ui/GirassolLogo';
import { ManagedLogo } from '@/components/ui/ManagedLogo';
import { MobileMenu } from './MobileMenu';
import type { ThemeSettings } from '@/types/cms';
import { usePublicNavigation } from '@/hooks/usePublicNavigation';

export function Navbar({ settings }: { settings?: ThemeSettings }) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const { data: links } = usePublicNavigation('main_menu');

  useEffect(() => {
    const handleScroll = () => setScrolled(scrollY > 30);
    handleScroll();
    addEventListener('scroll', handleScroll);
    return () => removeEventListener('scroll', handleScroll);
  }, []);

  const hasFitiLink = links.some((link: any) => link.url === '/fiti');

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition ${
        scrolled ? 'bg-black/85 shadow-2xl backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/#inicio"
          onDoubleClick={(event) => {
            event.preventDefault();
            router.push('/admin');
          }}
          className="flex items-center gap-3"
        >
          <ManagedLogo
            debugLabel="Navbar"
            settingKey="site_logo_url"
            alt={settings?.site_logo_alt || 'Associação Cultural Girassol'}
            className="h-14 w-auto object-contain"
            fallback={<GirassolLogo compact />}
          />
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-zinc-200 md:flex">
          {links.map((link: any) =>
            link.url === '/fiti' ? (
              <Link
                key={link.id || link.url}
                href={link.url}
                className="rounded-full bg-sun px-5 py-2 font-extrabold tracking-wide text-black shadow-lg shadow-yellow-400/30 ring-2 ring-yellow-200/70 transition hover:scale-105 hover:bg-yellow-300 hover:text-black"
              >
                ★ {link.label}
              </Link>
            ) : (
              <Link
                className="transition hover:text-sun"
                key={link.id || link.url}
                href={link.url}
              >
                {link.label}
              </Link>
            ),
          )}

          {!hasFitiLink && (
            <Link
              href="/fiti"
              className="rounded-full bg-sun px-5 py-2 font-extrabold tracking-wide text-black shadow-lg shadow-yellow-400/30 ring-2 ring-yellow-200/70 transition hover:scale-105 hover:bg-yellow-300 hover:text-black"
            >
              ★ FITI
            </Link>
          )}
        </nav>

        <MobileMenu
          links={links.map((link: any) => ({
            href: link.url,
            label: link.label,
          }))}
        />
      </div>
    </header>
  );
}
