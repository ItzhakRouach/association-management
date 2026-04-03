import { DashboardShell } from '@/components/layout/DashboardShell'
import { EmptyState } from '@/components/shared/EmptyState'
import { DonorsTable } from '@/components/donors/DonorsTable'
import { getAllDonors } from '@/lib/services/donor.service'
import { Heart } from 'lucide-react'

export default async function DonorsPage() {
  const donors = await getAllDonors()

  const tableData = donors.map(d => ({
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone,
    whatsapp: d.whatsapp,
    gender: d.gender,
    totalDonated: d.totalDonated,
    donationCount: d.donations.length,
    lastDonationDate: d.lastDonationDate,
    isCooling: d.isCooling,
  }))

  return (
    <DashboardShell title="תורמים" description="ניהול תורמי העמותה">
      {donors.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="אין תורמים עדיין"
          description="הוסף את התורם הראשון כדי להתחיל לעקוב אחרי תרומות ולנהל קשר עם תורמים"
        />
      ) : (
        <DonorsTable donors={tableData} />
      )}
    </DashboardShell>
  )
}
