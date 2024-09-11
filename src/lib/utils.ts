import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function removeQueryString(url?: string): string | undefined {

  if(!url) return; 
  
  try {
    const urlObject = new URL(url);
    return urlObject.origin + urlObject.pathname;
  } catch (e) {
    return url;
  }
}