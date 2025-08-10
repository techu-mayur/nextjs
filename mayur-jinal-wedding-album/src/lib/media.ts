export function toMediaUrl(pathOrUrl: string): string {
  if (!pathOrUrl) return '';
  // If it's already an absolute URL, return as-is
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || '';
  if (!base) return pathOrUrl;
  if (pathOrUrl.startsWith('/')) return `${base}${pathOrUrl}`;
  return `${base}/${pathOrUrl}`;
}


