import { LayoutDashboard, CalendarCheck, Users, Package, Wrench, BadgeIndianRupee, Images, Calculator, Star, HelpCircle, Settings, Bell, type LucideIcon } from 'lucide-react';
import type { AdminRole } from '@/lib/auth';

export type NavItem = { href: string; label: string; icon: LucideIcon; roles?: AdminRole[] };
const content: AdminRole[] = ['super_admin', 'admin'];   // staff = operations only (read-only on content)
export const NAV: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/services', label: 'Services', icon: Wrench },
  { href: '/admin/packages', label: 'Pricing & packages', icon: BadgeIndianRupee },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
  { href: '/admin/calculator', label: 'Calculator settings', icon: Calculator, roles: content },
  { href: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { href: '/admin/faqs', label: 'FAQs', icon: HelpCircle },
  { href: '/admin/settings', label: 'Website settings', icon: Settings, roles: content },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
];
