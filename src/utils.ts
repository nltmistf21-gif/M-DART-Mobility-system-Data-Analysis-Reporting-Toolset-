import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimestamp(ts: number) {
  return new Date(ts).toLocaleTimeString('en-US', { hour12: false, fractionalSecondDigits: 3 });
}

export function downsample(data: any[], targetPoints: number) {
  if (data.length <= targetPoints) return data;
  const factor = Math.ceil(data.length / targetPoints);
  return data.filter((_, i) => i % factor === 0);
}
