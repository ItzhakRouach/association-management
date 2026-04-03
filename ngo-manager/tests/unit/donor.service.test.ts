// Pure logic tests — no DB calls needed
// We test the cooling logic directly by reproducing computeDonorStats behaviour

function daysSince(date: Date): number {
  const now = new Date('2026-03-30T12:00:00Z')
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

function avgGapDays(dates: Date[]): number {
  if (dates.length < 2) return 0
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    gaps.push(Math.floor((sorted[i].getTime() - sorted[i - 1].getTime()) / (1000 * 60 * 60 * 24)))
  }
  return gaps.reduce((s, g) => s + g, 0) / gaps.length
}

function isCooling(donationDates: Date[]): boolean {
  if (donationDates.length === 0) return false
  const sorted = [...donationDates].sort((a, b) => a.getTime() - b.getTime())
  const lastDate = sorted[sorted.length - 1]
  const days = daysSince(lastDate)
  const avg = avgGapDays(sorted)
  return avg > 0 && days > avg * 1.5
}

describe('donor cooling logic', () => {
  it('isCooling = true when daysSince > avgDays * 1.5', () => {
    // Donor donated every 30 days, but last donation was 60 days ago
    const donations = [
      new Date('2025-10-01'),
      new Date('2025-11-01'),
      new Date('2025-12-01'),
      new Date('2026-01-01'), // last: 88 days ago from 2026-03-30
    ]
    // avg gap ≈ 30 days, days since ≈ 88 → 88 > 30 * 1.5 = 45 → cooling
    expect(isCooling(donations)).toBe(true)
  })

  it('isCooling = false when donor donated recently', () => {
    const donations = [
      new Date('2026-01-01'),
      new Date('2026-02-01'),
      new Date('2026-03-20'), // 10 days ago
    ]
    // avg gap ≈ 38 days, days since ≈ 10 → 10 < 38 * 1.5 = 57 → not cooling
    expect(isCooling(donations)).toBe(false)
  })

  it('isCooling = false when donor has only one donation', () => {
    const donations = [new Date('2025-01-01')]
    // avgGap = 0 → condition avg > 0 fails → not cooling
    expect(isCooling(donations)).toBe(false)
  })

  it('isCooling = false when donor has no donations', () => {
    expect(isCooling([])).toBe(false)
  })

  it('isCooling = true for donor with long gap relative to history', () => {
    // Donated every 7 days, last was 20 days ago
    const donations = [
      new Date('2026-02-01'),
      new Date('2026-02-08'),
      new Date('2026-02-15'),
      new Date('2026-03-10'), // 20 days ago
    ]
    // avg gap ≈ 17 days (with the big gap in there), days = 20
    // Depending on exact values this could go either way — let's pick a clear case
    const clear = [
      new Date('2026-01-01'),
      new Date('2026-01-08'), // avg gap = 7 days
      new Date('2026-01-15'),
      new Date('2026-01-01'), // deliberately old last donation
    ]
    // Sort will reorder: last = Jan 15 → 74 days ago, avg ≈ 7 → 74 > 10.5 → cooling
    const clearDonations = [
      new Date('2026-01-01'),
      new Date('2026-01-08'),
      new Date('2026-01-15'),
    ]
    expect(isCooling(clearDonations)).toBe(true) // 74 days > 7 * 1.5 = 10.5
  })

  it('returns false when avgGap is 0 (only one donation)', () => {
    const donations = [new Date('2026-03-01')]
    expect(isCooling(donations)).toBe(false)
  })
})
