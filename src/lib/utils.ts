import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a human-readable, URL-safe slug from arbitrary text
export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and') // replace ampersand with word
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}
