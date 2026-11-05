import { ResourceTable } from '@/components/admin/ResourceTable';
import { markNotificationsRead } from '../../actions';
export const metadata = { title: 'Notifications' };
export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; f?: string }> }) {
  return <ResourceTable title="Notifications" description="New bookings, enquiries, contact messages and review submissions. Email status says 'sent' only when the mail provider confirmed delivery."
    table="notifications" basePath="/admin/notifications" searchParams={await searchParams}
    columns={[{ key: 'type', label: 'Type', kind: 'badge' }, { key: 'title', label: 'Title' }, { key: 'is_read', label: 'Read', kind: 'bool' }, { key: 'email_status', label: 'Email', kind: 'badge' }, { key: 'created_at', label: 'When', kind: 'date' }]}
    filter={{ param: 'f', column: 'type', options: ['booking', 'enquiry', 'contact', 'review'] }}
    actions={<form action={markNotificationsRead}><button className="btn-primary">Mark all as read</button></form>} />;
}
