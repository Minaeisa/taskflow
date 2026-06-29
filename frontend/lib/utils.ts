import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isPast } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy');
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(date: string | Date) {
  return isPast(new Date(date));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-blue-500',   bg: 'bg-blue-50   dark:bg-blue-950' },
  medium: { label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-950' },
  high:   { label: 'High',   color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950' },
  urgent: { label: 'Urgent', color: 'text-red-500',    bg: 'bg-red-50    dark:bg-red-950' },
} as const;

export const STATUS_CONFIG = {
  todo:        { label: 'To Do',       color: 'bg-slate-100  text-slate-700' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100   text-blue-700' },
  in_review:   { label: 'In Review',   color: 'bg-purple-100 text-purple-700' },
  done:        { label: 'Done',        color: 'bg-green-100  text-green-700' },
} as const;
