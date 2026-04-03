import { DashboardShell } from '@/components/layout/DashboardShell'
import { OperationsTable } from '@/components/operations/OperationsTable'
import { getAllOperations } from '@/lib/services/operation.service'

export default async function OperationsPage() {
  const operations = await getAllOperations()

  return (
    <DashboardShell title="מבצעים" description="ניהול מבצעי העמותה — לחץ על מבצע לפרטים ושיבוץ מתנדבים">
      <OperationsTable operations={operations} />
    </DashboardShell>
  )
}
