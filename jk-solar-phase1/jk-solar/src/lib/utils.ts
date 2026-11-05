export const fmtDate = (d?: string | null) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '–';
export const label = (v?: string | null) => v ? v.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()) : '–';
