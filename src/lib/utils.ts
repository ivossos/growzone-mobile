import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { lookup } from 'react-native-mime-types';
import { UserDTO } from '@/api/@types/models';

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

export function getInitials(name: string = ''): string {
  const nameParts = name.split(' ');
  let initials = '';

  for (let i = 0; i < Math.min(nameParts.length, 2); i++) {
      const part = nameParts[i];
      if (part.length > 0) {
          initials += part[0].toUpperCase();
      }
  }

  return initials;
}

export function getUserName(user: UserDTO): string {
  return user?.name || user?.username;
}

export function formatDateIso(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

export function formatDateApi(dateString?: string) {
  if(!dateString) return;
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
}

export function maskDate(text: string) {
  const cleanText = text.replace(/\D/g, '');
  let maskedText = '';
  if (cleanText.length >= 1) maskedText += cleanText.substring(0, 2);
  if (cleanText.length >= 3) maskedText += '/' + cleanText.substring(2, 4);
  if (cleanText.length >= 5) maskedText += '/' + cleanText.substring(4, 8);

  return maskedText
};

export function maskPhone(text: string) {
  const cleanText = text.replace(/\D/g, '');

  let maskedText = '';

  if (cleanText.length > 0) {
    maskedText += `(${cleanText.substring(0, 2)})`;
  }
  if (cleanText.length >= 3) {
    maskedText += ` ${cleanText.substring(2, 3)} `;
  }
  if (cleanText.length >= 4) {
    maskedText += cleanText.substring(3, 7);
  }
  if (cleanText.length >= 7) {
    maskedText += `-${cleanText.substring(7, 11)}`;
  }

  return maskedText;
}

const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];


export function formatDateToMonthYear(dateString: string) {
  const date = new Date(dateString);
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  return `${month}/${year}`;
}

export function formatDistance(dateString: string) {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
}

export function getMimeType(uri: string): string | false {
  return lookup(uri);
}

export function replaceMediaUrl(url: string, newFileType = 'webp') {
  if (!url || typeof url !== 'string') {
    throw new Error("A URL fornecida é inválida.");
  }

  const newExtension = newFileType.toLowerCase() === 'm3u8' ? 'output.m3u8' : 'thumbnail.webp';

  const newUrl = url.replace(/\/[^/]+$/, `/${newExtension}`);
  
  return newUrl;
}