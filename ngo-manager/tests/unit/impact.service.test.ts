import { calculateImpactScore, getTrend } from '@/lib/services/impact.service'

describe('calculateImpactScore', () => {
  it('returns a value between 0 and 100 for a typical volunteer', () => {
    const score = calculateImpactScore({
      monthlyOps: 3,
      consecutiveMonths: 4,
      operationTypes: ['MEAL_DELIVERY', 'HOME_VISIT', 'HOLIDAY_EVENT'],
      prevMonthOps: 2,
    })
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('returns a minimal score for a volunteer with no activity (stable trend gives 5 pts)', () => {
    const score = calculateImpactScore({
      monthlyOps: 0,
      consecutiveMonths: 0,
      operationTypes: [],
      prevMonthOps: 0,
    })
    // 0 ops + 0 consistency + 0 variety + 5 stable-trend = 5
    expect(score).toBe(5)
  })

  it('gives more points for variety of operation types', () => {
    const manyTypes = calculateImpactScore({
      monthlyOps: 2,
      consecutiveMonths: 2,
      operationTypes: ['MEAL_DELIVERY', 'HOME_VISIT', 'HOLIDAY_EVENT', 'MEDICAL_ESCORT'],
      prevMonthOps: 2,
    })
    const fewTypes = calculateImpactScore({
      monthlyOps: 2,
      consecutiveMonths: 2,
      operationTypes: ['MEAL_DELIVERY', 'MEAL_DELIVERY'],
      prevMonthOps: 2,
    })
    expect(manyTypes).toBeGreaterThan(fewTypes)
  })

  it('caps operation points at 40 regardless of ops count', () => {
    const manyOps = calculateImpactScore({
      monthlyOps: 100,
      consecutiveMonths: 0,
      operationTypes: [],
      prevMonthOps: 50,
    })
    const fiveOps = calculateImpactScore({
      monthlyOps: 5,
      consecutiveMonths: 0,
      operationTypes: [],
      prevMonthOps: 3,
    })
    // both should cap operation points at 40
    expect(manyOps).toBe(fiveOps)
  })

  it('gives trend bonus when ops increased', () => {
    const withTrend = calculateImpactScore({
      monthlyOps: 3,
      consecutiveMonths: 0,
      operationTypes: [],
      prevMonthOps: 1,
    })
    const withoutTrend = calculateImpactScore({
      monthlyOps: 3,
      consecutiveMonths: 0,
      operationTypes: [],
      prevMonthOps: 4,
    })
    expect(withTrend).toBeGreaterThan(withoutTrend)
  })
})

describe('getTrend', () => {
  it('returns RISING when current > previous * 1.1', () => {
    expect(getTrend(10, 9)).toBe('RISING')
    expect(getTrend(5, 4)).toBe('RISING')
    expect(getTrend(12, 10)).toBe('RISING')
  })

  it('returns DECLINING when current < previous * 0.9', () => {
    expect(getTrend(8, 10)).toBe('DECLINING')
    expect(getTrend(3, 4)).toBe('DECLINING')
    expect(getTrend(0, 5)).toBe('DECLINING')
  })

  it('returns STABLE for values within ±10%', () => {
    expect(getTrend(10, 10)).toBe('STABLE')
    expect(getTrend(10, 9)).toBe('RISING')   // just above threshold
    expect(getTrend(9, 10)).toBe('STABLE')   // within 10%
    expect(getTrend(10, 11)).toBe('STABLE')  // within 10%
  })

  it('returns STABLE when both are zero', () => {
    expect(getTrend(0, 0)).toBe('STABLE')
  })
})
