import AvatarUser from './avatar-user';

export enum AvatarCanalEnum {
  WHATSAPP = 'whatsapp',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  OLX = 'olx',
  SHOWROOM = 'showroom',
  USADOSBR = 'usadosbr',
  ICARROS = 'icarros',
  MOBIAUTO = 'mobiauto',
  WEBMOTORS = 'webmotors',
  LIGACAO = 'ligacao',
  OUTROS = 'other',
}

interface AvatarCanalProps {
  channel: AvatarCanalEnum | string;
  size?: number;
  className?: string;
  padrao?: number;
  isActive?: boolean;
  showTooltip?: boolean;
}

type ChannelAssets = {
  name: string;
  avatarSrc: string;
  iconSrc?: string;
};

const CHANNELS: Record<AvatarCanalEnum, ChannelAssets> = {
  [AvatarCanalEnum.WHATSAPP]: {
    name: 'Whatsapp',
    avatarSrc: '/avatar/whatsapp.png',
    iconSrc: '/icons/whatsapp.svg',
  },
  [AvatarCanalEnum.INSTAGRAM]: {
    name: 'Instagram',
    avatarSrc: '/avatar/avatar_instagram.webp',
    iconSrc: '/icons/instagram.svg',
  },
  [AvatarCanalEnum.FACEBOOK]: {
    name: 'Facebook',
    avatarSrc: '/avatar/avatar_facebook.webp',
    iconSrc: '/icons/facebook.svg',
  },
  [AvatarCanalEnum.OLX]: {
    name: 'OLX',
    avatarSrc: '/avatar/avatar_olx.webp',
    iconSrc: '/icons/olx.svg',
  },
  [AvatarCanalEnum.SHOWROOM]: { name: 'Showroom', avatarSrc: '/avatar/avatar_showroom.webp' },
  [AvatarCanalEnum.USADOSBR]: { name: 'UsadosBR', avatarSrc: '/avatar/avatar_usadosbr.webp' },
  [AvatarCanalEnum.ICARROS]: { name: 'Icarros', avatarSrc: '/avatar/avatar_icarros.webp' },
  [AvatarCanalEnum.MOBIAUTO]: { name: 'MobiAuto', avatarSrc: '/avatar/avatar_mobiauto.webp' },
  [AvatarCanalEnum.WEBMOTORS]: { name: 'Webmotors', avatarSrc: '/avatar/avatar_webmotors.webp' },
  [AvatarCanalEnum.LIGACAO]: { name: 'Ligação', avatarSrc: '/avatar/avatar_ligacao.webp' },
  [AvatarCanalEnum.OUTROS]: { name: 'Outro', avatarSrc: '/avatar/avatar_outro.jpg' },
};

function normalizeCanal(input: AvatarCanalEnum | string): AvatarCanalEnum {
  const key = String(input).toLowerCase() as AvatarCanalEnum;
  return (CHANNELS as any)[key] ? key : AvatarCanalEnum.OUTROS;
}

export default function AvatarCanal({
  channel,
  size = 2,
  className = '',
  padrao = 0,
  isActive = true,
  showTooltip = true,
}: AvatarCanalProps) {
  const normalized = normalizeCanal(channel);
  const assets = CHANNELS[normalized];

  if (padrao === 0) {
    return (
      <AvatarUser src={assets.avatarSrc} name={assets.name} size={size} className={className} />
    );
  }

  const wrapperSizeRem = size + 1.4;
  const imgSrc = assets.iconSrc ?? assets.avatarSrc;

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#F7F9FC] border border-[#DDE6F2] ring-1 ring-[#E3E6EC] hover:ring-[#DDE6F2] hover:shadow-sm transition-all duration-200 ease-out group relative ${className}`}
      style={{ width: `${wrapperSizeRem}rem`, height: `${wrapperSizeRem}rem` }}
      aria-label={assets.name}
      title={showTooltip ? undefined : assets.name}
      data-active={isActive}
    >
      {showTooltip && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-[9999] opacity-0 scale-75 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-200 ease-out"
          role="tooltip"
        >
          <div className="bg-[hsl(var(--secondary))] text-secondary-foreground text-xs font-medium px-3 py-1.5 rounded-md whitespace-nowrap shadow-lg border border-gray-700 relative">
            {assets.name}
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[hsl(var(--secondary))]" />
          </div>
        </div>
      )}

      <img
        src={imgSrc}
        alt={assets.name}
        style={{ width: `${size}rem`, height: `${size}rem` }}
        className={`${!isActive ? 'filter grayscale opacity-60' : ''} block object-contain pointer-events-none`}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </div>
  );
}
