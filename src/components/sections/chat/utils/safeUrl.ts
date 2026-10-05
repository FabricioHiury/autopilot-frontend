export function safeUrl(url?: string | null): string {
  if (!url) return '#';
  const trimmed = url.trim();
  try {
    const u = new URL(trimmed);
    if (u.protocol === 'http:' || u.protocol === 'https:') return u.toString();
  } catch {}
  const domainLike = /^(?:www\.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[\S]*)?$/.test(trimmed);
  if (domainLike) {
    try {
      const u2 = new URL(`https://${trimmed}`);
      return u2.toString();
    } catch {}
  }
  return '#';
}
