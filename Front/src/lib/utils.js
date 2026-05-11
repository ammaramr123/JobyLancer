import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const buildImageUrl = (url) => {
  if (!url || typeof url !== 'string') return null;

  // لو URL كامل سيبه زي ما هو
  if (url.startsWith('http')) return url;

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5186';
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
