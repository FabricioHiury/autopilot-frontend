/**
 * Utility function to merge class names
 * @param inputs - The class values to merge
 * @returns The merged class names
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
