import { API_IMAGE_URL } from '../services/api';

// Centralized image URL normalization.
// The backend/AI may return Windows-style paths (backslashes), bare filenames,
// relative paths, or already-absolute URLs. Everything is routed through here so
// we never duplicate this logic across components. See design spec #18.

const FALLBACK_IMAGE_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="750" viewBox="0 0 600 750">
      <rect width="600" height="750" fill="#efe8dc"/>
      <g transform="translate(300,300)" stroke="#b28a4b" fill="none" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M0 -150 C -60 -60, -140 -10, -160 20 L -20 90 L -20 160 h 40 L 20 90 L 160 20 C 140 -10, 60 -60, 0 -150"/>
        <path d="M -40 -40 C -20 -10, 20 -10, 40 -40 C 20 -60, -20 -60, -40 -40"/>
      </g>
    </svg>`,
  );

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

function isDataUrl(value: string): boolean {
  return /^data:image\//i.test(value);
}

function isBlobUrl(value: string): boolean {
  return /^blob:/i.test(value);
}

/**
 * Convert any image reference into a browser-ready, absolute URL.
 * - Replaces Windows backslashes with forward slashes.
 * - Bare filenames are resolved against the API images folder.
 * - Absolute URLs and blob/data URLs pass through untouched.
 * - Returns a fallback image when the source is missing/unusable.
 */
export function resolveImageUrl(value?: string | null): string {
  if (!value) return FALLBACK_IMAGE_URL;

  // Strip a leading slash so we can safely join with the API base.
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');

  if (isHttpUrl(normalized)) return normalized;
  if (isDataUrl(normalized)) return normalized;
  if (isBlobUrl(normalized)) return normalized;

  // Handle paths like "images/foo.jpg" or "uploads/foo.jpg" that are relative
  // to the API root. We ignore a leading "images/" folder duplication.
  const relative = normalized.replace(/^images\//i, '');

  if (!relative) return FALLBACK_IMAGE_URL;

  return `${API_IMAGE_URL}/${relative}`;
}

/** Format a numeric price into a currency string (e.g. $49.99). */
export function formatPrice(price: number | string | undefined | null): string {
  const num = Number(price);
  if (Number.isNaN(num)) return '$0.00';
  return `$${num.toFixed(2)}`;
}

export { FALLBACK_IMAGE_URL };
