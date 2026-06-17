import { format } from 'date-fns';

export function formatDate(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return format(d, fmt);
}
