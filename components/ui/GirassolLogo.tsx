import { cn } from '@/lib/utils';
import { GIRASSOL_FALLBACK_LOGO } from '@/lib/fallbackLogos';

type GirassolLogoProps = { compact?: boolean; className?: string };

export function GirassolLogo({ compact = false, className }: GirassolLogoProps) {
  return <img src={GIRASSOL_FALLBACK_LOGO} alt="Associação Cultural Girassol" width={586} height={575}
    className={cn('w-auto object-contain',compact?'h-14':'h-28 md:h-36',className)} data-official-fallback-logo="girassol" />;
}
