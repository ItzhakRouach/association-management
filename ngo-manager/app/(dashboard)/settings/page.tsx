import { prisma } from '@/lib/prisma'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { SettingsForm } from '@/components/settings/SettingsForm'

async function getSettings() {
  const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  return {
    orgName: settings?.orgName ?? '',
    orgDescription: settings?.orgDescription ?? '',
    councilEmail: settings?.councilEmail ?? '',
  }
}

export default async function SettingsPage() {
  const settings = await getSettings()

  return (
    <DashboardShell title="הגדרות" description="הגדרות מערכת העמותה">
      <SettingsForm initialValues={settings} />
    </DashboardShell>
  )
}
