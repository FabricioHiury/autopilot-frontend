import Image from 'next/image';

export function AutoPilotLogo({ dark = false, compact = false }: {
  dark?: boolean;
  compact?: boolean;
}) {
  return (
    <Image
      src={compact ? '/images/logo-simple.png' : dark ? '/images/logo_autopilot.svg' : '/images/logo_autopilot_dark.svg'}
      alt="AutoPilot"
      width={compact ? 32 : 163}
      height={compact ? 32 : 33}
      className="object-contain shrink-0"
      priority
    />
  );
}
