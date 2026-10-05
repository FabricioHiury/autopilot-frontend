'use client';
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
  return (
    <span className="inline-flex items-center gap-2 font-bold tracking-tight">
      <span className="rounded-lg bg-primary text-primary-foreground px-2 py-1">A↗</span>
      {!compact && (
        <span>
          {tenant?.displayName || 'AutoPilot'}
          <small className="block text-[10px] font-medium tracking-[0.18em] opacity-70">
            CRM INTELIGENTE
          </small>
        </span>
      )}
    </span>
  );
}
