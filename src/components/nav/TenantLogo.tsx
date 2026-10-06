'use client';
import { AutoPilotLogo } from './AutoPilotLogo';
import { useOptionalTenant } from '@/contexts/TenantContext';
import { safeAssetUrl, contrastColor, DEFAULT_COLORS } from '@/lib/tenant-theme';
export function TenantLogo({
  dark = false,
  compact = false,
}: {
  dark?: boolean;
  compact?: boolean;
}) {
  const context = useOptionalTenant();
  const tenant = context?.tenant;
  const onDarkBackground =
    dark && contrastColor(tenant?.secondaryColor || DEFAULT_COLORS.secondaryColor) === '0 0% 100%';
  const url =
    safeAssetUrl(onDarkBackground ? tenant?.logoDarkUrl : tenant?.logoLightUrl) ||
    safeAssetUrl(onDarkBackground ? tenant?.logoLightUrl : tenant?.logoDarkUrl);
  if (url)
    return (
      <img
        src={url}
        alt={tenant?.displayName || 'AutoPilot CRM'}
        className={compact ? 'h-10 w-10 object-contain' : 'h-9 max-w-[170px] object-contain'}
      />
    );
  return <AutoPilotLogo dark={onDarkBackground} compact={compact} />;
}
