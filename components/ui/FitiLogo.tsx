import { cn } from '@/lib/utils';
import { FITI_FALLBACK_LOGO } from '@/lib/fallbackLogos';

type FitiLogoProps = { compact?: boolean; className?: string };

export function FitiLogo({ compact = false, className }: FitiLogoProps) {
  return <img src={FITI_FALLBACK_LOGO} alt="FITI – Festival Internacional Teatro de Inverno" width={586} height={575}
    className={cn('w-auto object-contain',compact?'h-16':'h-32 md:h-40',className)} data-official-fallback-logo="fiti" />;
}
