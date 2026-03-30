import { redirect } from 'next/navigation'

export default function PortalAdminLayout({ children }: { children: React.ReactNode }) {
  redirect('/admin')
}
