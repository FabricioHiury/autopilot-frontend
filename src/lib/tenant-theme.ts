import type { TenantConfig } from '@/types/store';
export const DEFAULT_COLORS = {
  primaryColor: '#087F8C',
  secondaryColor: '#172D3E',
  accentColor: '#D98C10',
};
export function hexToHsl(hex: string): string {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error('Use uma cor hexadecimal de seis dígitos.');
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min,
    l = (max + min) / 2;
  let h = 0,
    s = 0;
  if (delta) {
    s = delta / (1 - Math.abs(2 * l - 1));
    h = max === r ? ((g - b) / delta) % 6 : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return `${h.toFixed(2)} ${(s * 100).toFixed(2)}% ${(l * 100).toFixed(2)}%`;
}
export function contrastColor(hex: string): string {
  const components = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return components[0] * 0.2126 + components[1] * 0.7152 + components[2] * 0.0722 > 0.179
    ? '222 30% 12%'
    : '0 0% 100%';
}
export function safeAssetUrl(url: string | null | undefined) {
  try {
    return url && new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}
export function applyTenantTheme(config: Partial<TenantConfig> | null) {
  if (typeof document === 'undefined') return;
  for (const [field, variable] of [
    ['primaryColor', 'primary'],
    ['secondaryColor', 'secondary'],
    ['accentColor', 'accent'],
  ] as const) {
    const color =
      config?.[field] && /^#[\da-f]{6}$/i.test(config[field]!)
        ? config[field]!
        : DEFAULT_COLORS[field];
    document.documentElement.style.setProperty(`--${variable}`, hexToHsl(color));
    document.documentElement.style.setProperty(`--${variable}-foreground`, contrastColor(color));
    if (variable === 'primary') {
      document.documentElement.style.setProperty('--ring', hexToHsl(color));
      document.documentElement.style.setProperty('--chart-1', hexToHsl(color));
    }
  }
  let favicon = document.querySelector<HTMLLinkElement>('link[data-tenant-favicon]');
  const url = safeAssetUrl(config?.faviconUrl);
  if (url) {
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      favicon.dataset.tenantFavicon = 'true';
      document.head.append(favicon);
    }
    favicon.href = url;
  } else favicon?.remove();
  document.title = config?.displayName ? `${config.displayName} · AutoPilot CRM` : 'AutoPilot CRM';
}
