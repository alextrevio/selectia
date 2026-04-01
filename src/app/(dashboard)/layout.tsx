export const dynamic = 'force-dynamic'

import { Sidebar } from '@/components/layout/sidebar'
import { MobileBottomNav } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#FAFAFA] dark:bg-background p-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
