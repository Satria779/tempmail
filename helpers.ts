export const formatTime = (ts?: string): string => {
  if (!ts) return '';
  const d = new Date(ts);
  return d.toLocaleString('id-ID', { hour12: false });
};

export const stripHtml = (html?: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, '');
};

export const truncate = (text: string, max: number = 120): string => {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
};