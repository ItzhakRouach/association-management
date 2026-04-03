import { PrismaClient, OperationType, OperationStatus, AssignmentStatus, Trend } from '@prisma/client'

const prisma = new PrismaClient()

// Reference date: 2026-04-03
const TODAY = new Date('2026-04-03T12:00:00.000Z')

function daysAgo(days: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() - days)
  return d
}

function daysFromNow(days: number): Date {
  const d = new Date(TODAY)
  d.setDate(d.getDate() + days)
  return d
}

async function main(): Promise<void> {
  console.log('Cleaning database...')

  // Delete in reverse dependency order
  await prisma.appreciationLetter.deleteMany()
  await prisma.impactScore.deleteMany()
  await prisma.donorOutreach.deleteMany()
  await prisma.operationAssignment.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.operation.deleteMany()
  await prisma.volunteer.deleteMany()
  await prisma.donor.deleteMany()
  await prisma.monthlyReport.deleteMany()
  await prisma.settings.deleteMany()

  console.log('Seeding settings...')

  await prisma.settings.create({
    data: {
      id: 'singleton',
      orgName: 'עמותת יד לקשיש',
      councilEmail: 'council@example.com',
      orgDescription: 'עמותה המסייעת לקשישים החיים לבד בקהילה',
    },
  })

  console.log('Seeding volunteers...')

  // Top 1: Moshe Cohen — most active this month (Passover operations)
  const moshe = await prisma.volunteer.create({
    data: {
      name: 'משה כהן',
      email: 'moshe.cohen@example.com',
      phone: '050-1111111',
      skills: ['בישול', 'נהיגה', 'עזרה רפואית', 'ליווי ושיחה', 'עזרה טכנולוגית'],
      isActive: true,
      joinedAt: daysAgo(365),
    },
  })

  // Top 2: Yael Levy — consistent volunteer
  const yael = await prisma.volunteer.create({
    data: {
      name: 'יעל לוי',
      email: 'yael.levy@example.com',
      phone: '050-2222222',
      skills: ['בישול', 'ליווי ושיחה', 'עזרה רפואית'],
      isActive: true,
      joinedAt: daysAgo(180),
    },
  })

  // Top 3: David Mizrahi — rising trend
  const david = await prisma.volunteer.create({
    data: {
      name: 'דוד מזרחי',
      email: 'david.mizrahi@example.com',
      phone: '050-3333333',
      skills: ['נהיגה', 'ליווי ושיחה'],
      isActive: true,
      joinedAt: daysAgo(120),
    },
  })

  const sarah = await prisma.volunteer.create({
    data: {
      name: 'שרה אברהם',
      email: 'sarah.abraham@example.com',
      phone: '050-4444444',
      skills: ['בישול', 'ליווי ושיחה'],
      isActive: true,
      joinedAt: daysAgo(200),
    },
  })

  const avi = await prisma.volunteer.create({
    data: {
      name: 'אבי פרץ',
      email: 'avi.peretz@example.com',
      phone: '050-5555555',
      skills: ['נהיגה', 'עזרה טכנולוגית'],
      isActive: true,
      joinedAt: daysAgo(90),
    },
  })

  const miriam = await prisma.volunteer.create({
    data: {
      name: 'מרים שפירא',
      email: 'miriam.shapira@example.com',
      phone: '050-6666666',
      skills: ['עזרה רפואית', 'ליווי ושיחה'],
      isActive: true,
      joinedAt: daysAgo(150),
    },
  })

  const ron = await prisma.volunteer.create({
    data: {
      name: 'רון גולן',
      email: 'ron.golan@example.com',
      phone: '050-7777777',
      skills: ['עזרה טכנולוגית', 'נהיגה'],
      isActive: true,
      joinedAt: daysAgo(60),
    },
  })

  const noa = await prisma.volunteer.create({
    data: {
      name: 'נועה ברק',
      email: 'noa.barak@example.com',
      phone: '050-8888888',
      skills: ['בישול', 'עזרה רפואית'],
      isActive: true,
      joinedAt: daysAgo(240),
    },
  })

  const eli = await prisma.volunteer.create({
    data: {
      name: 'אלי כץ',
      email: 'eli.katz@example.com',
      phone: '050-9999999',
      skills: ['ליווי ושיחה', 'עזרה טכנולוגית'],
      isActive: true,
      joinedAt: daysAgo(30),
    },
  })

  const tamar = await prisma.volunteer.create({
    data: {
      name: 'תמר רוזן',
      email: 'tamar.rosen@example.com',
      phone: '050-1010101',
      skills: ['בישול', 'נהיגה', 'ליווי ושיחה'],
      isActive: false, // inactive volunteer to test filtering
      joinedAt: daysAgo(400),
    },
  })

  console.log('Seeding donors...')

  // Cooling donor 1: Yossi Katz — last donation ~50 days ago
  const yossi = await prisma.donor.create({
    data: {
      name: 'יוסי כץ',
      email: 'yossi.katz@example.com',
      phone: '052-1111111',
    },
  })

  // Cooling donor 2: Rachel Levi — last donation ~75 days ago
  const rachel = await prisma.donor.create({
    data: {
      name: 'רחל לוי',
      email: 'rachel.levi@example.com',
      phone: '052-2222222',
    },
  })

  const benny = await prisma.donor.create({
    data: {
      name: 'בני שמש',
      email: 'benny.shemesh@example.com',
      phone: '052-3333333',
    },
  })

  const hana = await prisma.donor.create({
    data: {
      name: 'חנה גרין',
      email: 'hana.green@example.com',
      phone: '052-4444444',
    },
  })

  const itamar = await prisma.donor.create({
    data: {
      name: 'איתמר בן-דוד',
      email: 'itamar.bendavid@example.com',
      phone: '052-5555555',
    },
  })

  const dina = await prisma.donor.create({
    data: {
      name: 'דינה פישמן',
      email: 'dina.fishman@example.com',
      phone: '052-6666666',
    },
  })

  const yoram = await prisma.donor.create({
    data: {
      name: 'יורם אלון',
      email: 'yoram.alon@example.com',
      phone: '052-7777777',
    },
  })

  const michal = await prisma.donor.create({
    data: {
      name: 'מיכל ורד',
      email: 'michal.vered@example.com',
      phone: '052-8888888',
    },
  })

  console.log('Seeding donations...')

  // Yossi Katz: last donation 50 days ago → COOLING
  await prisma.donation.createMany({
    data: [
      { donorId: yossi.id, amount: 500, date: daysAgo(108), note: 'תרומה שנתית' },
      { donorId: yossi.id, amount: 300, date: daysAgo(88), note: 'ראש השנה' },
      { donorId: yossi.id, amount: 400, date: daysAgo(67), note: 'פורים' },
      { donorId: yossi.id, amount: 500, date: daysAgo(50), note: '' },
    ],
  })

  // Rachel Levi: last donation 75 days ago → COOLING
  await prisma.donation.createMany({
    data: [
      { donorId: rachel.id, amount: 200, date: daysAgo(115), note: '' },
      { donorId: rachel.id, amount: 150, date: daysAgo(95), note: '' },
      { donorId: rachel.id, amount: 200, date: daysAgo(75), note: '' },
    ],
  })

  // Active donors — this month (April) donations: Passover giving season
  await prisma.donation.createMany({
    data: [
      // Benny — Passover donation + prior
      { donorId: benny.id, amount: 1000, date: daysAgo(83), note: '' },
      { donorId: benny.id, amount: 1200, date: daysAgo(43), note: '' },
      { donorId: benny.id, amount: 2500, date: daysAgo(2), note: 'תרומה לפסח' },

      // Hana — Passover
      { donorId: hana.id, amount: 500, date: daysAgo(78), note: '' },
      { donorId: hana.id, amount: 800, date: daysAgo(48), note: '' },
      { donorId: hana.id, amount: 1800, date: daysAgo(1), note: 'מעות חיטים' },

      // Itamar — this month
      { donorId: itamar.id, amount: 600, date: daysAgo(58), note: '' },
      { donorId: itamar.id, amount: 2000, date: daysAgo(1), note: 'לכבוד הפסח' },

      // Dina — this month
      { donorId: dina.id, amount: 400, date: daysAgo(68), note: '' },
      { donorId: dina.id, amount: 1500, date: daysAgo(2), note: 'תרומת חג' },

      // Yoram — this month
      { donorId: yoram.id, amount: 300, date: daysAgo(93), note: '' },
      { donorId: yoram.id, amount: 200, date: daysAgo(53), note: '' },
      { donorId: yoram.id, amount: 1200, date: daysAgo(1), note: '' },

      // Michal — last month only
      { donorId: michal.id, amount: 750, date: daysAgo(73), note: '' },
      { donorId: michal.id, amount: 500, date: daysAgo(38), note: '' },
    ],
  })

  // Total this month (April): 2500 + 1800 + 2000 + 1500 + 1200 = 9000

  console.log('Seeding operations...')

  // ── UPCOMING OPERATIONS (April 2026 — Passover week) ──

  // "סדר שני לקשישים בודדים" — April 5 (2nd Passover seder), PLANNED, no assignments → dashboard alert
  const secondSeder = await prisma.operation.create({
    data: {
      title: 'סדר שני לקשישים בודדים',
      description: 'ארגון וקיום ליל סדר שני לקשישים שאין להם משפחה',
      type: OperationType.HOLIDAY_EVENT,
      date: daysFromNow(2),
      status: OperationStatus.PLANNED,
    },
  })

  // "ביקורי בית בחול המועד" — April 7, PLANNED, 2 CONFIRMED
  const holidayVisit = await prisma.operation.create({
    data: {
      title: 'ביקורי בית בחול המועד',
      description: 'ביקורי בית לקשישים בודדים במהלך חול המועד פסח',
      type: OperationType.HOME_VISIT,
      date: daysFromNow(4),
      status: OperationStatus.PLANNED,
    },
  })

  // "חלוקת חבילות מזון לאחר פסח" — April 13, PLANNED
  const postPassoverFood = await prisma.operation.create({
    data: {
      title: 'חלוקת חבילות מזון לאחר פסח',
      description: 'חלוקת חבילות מזון לקשישים עם תום חג הפסח',
      type: OperationType.MEAL_DELIVERY,
      date: daysFromNow(10),
      status: OperationStatus.PLANNED,
    },
  })

  // "ליווי לבדיקות אחרי החג" — April 20, PLANNED
  const postHolidayMedical = await prisma.operation.create({
    data: {
      title: 'ליווי לבדיקות אחרי החג',
      description: 'ליווי קשישים לבדיקות רפואיות שנדחו בגלל החג',
      type: OperationType.MEDICAL_ESCORT,
      date: daysFromNow(17),
      status: OperationStatus.PLANNED,
    },
  })

  // ── CURRENT MONTH COMPLETED (April 1–3) — Passover themed ──

  // "ערב הסדר לקשישים בודדים" — April 1, COMPLETED (סדר ליל ראשון של פסח)
  const firstSeder = await prisma.operation.create({
    data: {
      title: 'ערב הסדר לקשישים בודדים',
      description: 'ארגון וקיום ליל סדר ראשון לקשישים שאין להם משפחה',
      type: OperationType.HOLIDAY_EVENT,
      date: daysAgo(2),
      status: OperationStatus.COMPLETED,
    },
  })

  // "חלוקת מנות פסח" — April 2, COMPLETED
  const passoverMeals = await prisma.operation.create({
    data: {
      title: 'חלוקת מנות פסח',
      description: 'חלוקת מנות חמות כשרות לפסח לקשישים בשכונה',
      type: OperationType.MEAL_DELIVERY,
      date: daysAgo(1),
      status: OperationStatus.COMPLETED,
    },
  })

  // ── LAST MONTH (March 2026) COMPLETED OPERATIONS ──

  const op_march_meal = await prisma.operation.create({
    data: {
      title: 'חלוקת ארוחות מרץ',
      description: 'חלוקת ארוחות חמות לקשישים בשכונה',
      type: OperationType.MEAL_DELIVERY,
      date: daysAgo(23),
      status: OperationStatus.COMPLETED,
    },
  })

  const op_march_home = await prisma.operation.create({
    data: {
      title: 'ביקורי בית חודשיים',
      description: 'ביקורי בית חודשיים אצל קשישים בודדים',
      type: OperationType.HOME_VISIT,
      date: daysAgo(21),
      status: OperationStatus.COMPLETED,
    },
  })

  const op_march_purim = await prisma.operation.create({
    data: {
      title: 'אירוע פורים לקשישים',
      description: 'אירוע חגיגי לציון חג פורים עם הקשישים',
      type: OperationType.HOLIDAY_EVENT,
      date: daysAgo(18),
      status: OperationStatus.COMPLETED,
    },
  })

  const op_march_medical = await prisma.operation.create({
    data: {
      title: 'ליווי לבדיקות רפואיות',
      description: 'ליווי קשישים לבדיקות רפואיות במרפאה',
      type: OperationType.MEDICAL_ESCORT,
      date: daysAgo(13),
      status: OperationStatus.COMPLETED,
    },
  })

  const op_march_other = await prisma.operation.create({
    data: {
      title: 'סיוע בקניות לקראת פסח',
      description: 'סיוע לקשישים בקניות ובניקיון לקראת חג הפסח',
      type: OperationType.OTHER,
      date: daysAgo(8),
      status: OperationStatus.COMPLETED,
    },
  })

  const op_march_meal2 = await prisma.operation.create({
    data: {
      title: 'חלוקת מזון ערב פסח',
      description: 'חלוקת מוצרי מזון כשר לפסח לקשישים נזקקים',
      type: OperationType.MEAL_DELIVERY,
      date: daysAgo(6),
      status: OperationStatus.COMPLETED,
    },
  })

  console.log('Seeding assignments...')

  // ── "ביקורי בית בחול המועד" — 2 CONFIRMED assignments ──
  await prisma.operationAssignment.createMany({
    data: [
      { volunteerId: sarah.id, operationId: holidayVisit.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: miriam.id, operationId: holidayVisit.id, status: AssignmentStatus.CONFIRMED },
    ],
  })

  // ── "סדר שני" — 1 SUGGESTED assignment (no confirmed yet → dashboard alert) ──
  await prisma.operationAssignment.createMany({
    data: [
      { volunteerId: eli.id, operationId: secondSeder.id, status: AssignmentStatus.SUGGESTED },
    ],
  })

  // ── April completed: "ערב הסדר" — Moshe, Yael, Sarah, Noa ──
  await prisma.operationAssignment.createMany({
    data: [
      { volunteerId: moshe.id, operationId: firstSeder.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: yael.id, operationId: firstSeder.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: sarah.id, operationId: firstSeder.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: noa.id, operationId: firstSeder.id, status: AssignmentStatus.CONFIRMED },
    ],
  })

  // ── April completed: "חלוקת מנות פסח" — Moshe, David, Avi ──
  await prisma.operationAssignment.createMany({
    data: [
      { volunteerId: moshe.id, operationId: passoverMeals.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: david.id, operationId: passoverMeals.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: avi.id, operationId: passoverMeals.id, status: AssignmentStatus.CONFIRMED },
    ],
  })

  // ── March assignments for impact score history ──
  await prisma.operationAssignment.createMany({
    data: [
      // Moshe: all 6 March operations
      { volunteerId: moshe.id, operationId: op_march_meal.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: moshe.id, operationId: op_march_home.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: moshe.id, operationId: op_march_purim.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: moshe.id, operationId: op_march_medical.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: moshe.id, operationId: op_march_other.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: moshe.id, operationId: op_march_meal2.id, status: AssignmentStatus.CONFIRMED },

      // Yael: 3 March operations
      { volunteerId: yael.id, operationId: op_march_meal.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: yael.id, operationId: op_march_home.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: yael.id, operationId: op_march_purim.id, status: AssignmentStatus.CONFIRMED },

      // David: 2 March operations
      { volunteerId: david.id, operationId: op_march_medical.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: david.id, operationId: op_march_other.id, status: AssignmentStatus.CONFIRMED },

      // Others
      { volunteerId: sarah.id, operationId: op_march_meal2.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: avi.id, operationId: op_march_meal2.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: ron.id, operationId: op_march_other.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: noa.id, operationId: op_march_purim.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: miriam.id, operationId: op_march_home.id, status: AssignmentStatus.CONFIRMED },
      { volunteerId: eli.id, operationId: op_march_other.id, status: AssignmentStatus.CONFIRMED },
    ],
  })

  console.log('Seeding impact scores...')

  // Impact scores for April (month 4) — early month, based on 2 completed operations so far
  // Moshe: 2 ops this month (HOLIDAY_EVENT + MEAL_DELIVERY), 6 consecutive months, was 6 last month
  // ops=2: 2*8=16 | consistency=6: 6*5=30 | variety=2: 2*5=10 | trend: 2<6 → DECLINING (early month) = 0
  // total = 16 + 30 + 10 + 0 = 56
  await prisma.impactScore.create({
    data: {
      volunteerId: moshe.id,
      score: 56,
      month: 4,
      year: 2026,
      operationCount: 2,
      consistencyScore: 30,
      activityTypes: ['HOLIDAY_EVENT', 'MEAL_DELIVERY'],
      trend: Trend.STABLE,
    },
  })

  // Yael: 1 op this month (HOLIDAY_EVENT), 4 consecutive months, was 3 last month
  // ops=1: 8 | consistency=4: 20 | variety=1: 5 | trend: 1<3 → declining but early month
  // total = 8 + 20 + 5 + 5 = 38
  await prisma.impactScore.create({
    data: {
      volunteerId: yael.id,
      score: 38,
      month: 4,
      year: 2026,
      operationCount: 1,
      consistencyScore: 20,
      activityTypes: ['HOLIDAY_EVENT'],
      trend: Trend.STABLE,
    },
  })

  // David: 1 op this month (MEAL_DELIVERY), 3 consecutive months, was 2 last month
  // ops=1: 8 | consistency=3: 15 | variety=1: 5 | trend: STABLE (early month)
  // total = 8 + 15 + 5 + 5 = 33
  await prisma.impactScore.create({
    data: {
      volunteerId: david.id,
      score: 33,
      month: 4,
      year: 2026,
      operationCount: 1,
      consistencyScore: 15,
      activityTypes: ['MEAL_DELIVERY'],
      trend: Trend.STABLE,
    },
  })

  // Sarah: 1 op this month (HOLIDAY_EVENT), 2 consecutive months
  // ops=1: 8 | consistency=2: 10 | variety=1: 5 | trend: STABLE
  // total = 8 + 10 + 5 + 5 = 28
  await prisma.impactScore.create({
    data: {
      volunteerId: sarah.id,
      score: 28,
      month: 4,
      year: 2026,
      operationCount: 1,
      consistencyScore: 10,
      activityTypes: ['HOLIDAY_EVENT'],
      trend: Trend.STABLE,
    },
  })

  // Avi: 1 op this month (MEAL_DELIVERY), 2 consecutive months
  await prisma.impactScore.create({
    data: {
      volunteerId: avi.id,
      score: 23,
      month: 4,
      year: 2026,
      operationCount: 1,
      consistencyScore: 10,
      activityTypes: ['MEAL_DELIVERY'],
      trend: Trend.RISING,
    },
  })

  // Noa: 1 op this month, new this month
  await prisma.impactScore.create({
    data: {
      volunteerId: noa.id,
      score: 18,
      month: 4,
      year: 2026,
      operationCount: 1,
      consistencyScore: 5,
      activityTypes: ['HOLIDAY_EVENT'],
      trend: Trend.RISING,
    },
  })

  // Miriam: 0 ops this month (confirmed for upcoming) → declining
  await prisma.impactScore.create({
    data: {
      volunteerId: miriam.id,
      score: 10,
      month: 4,
      year: 2026,
      operationCount: 0,
      consistencyScore: 5,
      activityTypes: [],
      trend: Trend.DECLINING,
    },
  })

  console.log('Seeding appreciation letters...')

  // Letters for top March performers (month: 3)
  await prisma.appreciationLetter.create({
    data: {
      volunteerId: moshe.id,
      content:
        'שלום משה,\n\nברצוננו להביע את הערכתנו העמוקה על תרומתך המיוחדת לעמותה בחודש מרץ. השתתפותך ב-6 מבצעים שונים — כולל סיוע בקניות לקראת פסח, חלוקת מזון, ביקורי בית, אירוע פורים, ליווי רפואי וחלוקת מזון ערב פסח — מדגישה את מסירותך ואת הרוחב המרשים של תרומתך לקהילה.\n\nאנו שמחים לדעת שהקשישים שלנו נכנסו לחג הפסח בזכות עבודתך. תודה מכל הלב.\n\nבהוקרה ובהכרת תודה,\nצוות עמותת יד לקשיש',
      status: 'PENDING',
      month: 3,
      year: 2026,
    },
  })

  await prisma.appreciationLetter.create({
    data: {
      volunteerId: yael.id,
      content:
        'שלום יעל,\n\nאנו שמחים לציין את מסירותך ועקביותך המרשימה לאורך חודשים רבים. בחודש מרץ לקחת חלק ב-3 מבצעים חשובים — חלוקת ארוחות, ביקורי בית ואירוע פורים לקשישים — ותרומתך היא עמוד השדרה של פעילות העמותה.\n\nכניסה לחג הפסח עם ידיעה שיש מי שדואג לקשישים שלנו — זכות גדולה, ואת שותפה בה.\n\nתודה רבה מכל הלב,\nצוות עמותת יד לקשיש',
      status: 'PENDING',
      month: 3,
      year: 2026,
    },
  })

  await prisma.appreciationLetter.create({
    data: {
      volunteerId: david.id,
      content:
        'שלום דוד,\n\nאנו שמחים לראות את הצמיחה שלך כמתנדב בעמותה. בחודש מרץ השתתפת ב-2 מבצעים — ליווי רפואי וסיוע בקניות לפסח — ואנו מבחינים במגמת עלייה מרשימה בפעילותך.\n\nכל פגישה שאתה מלווה ומכל קשיש שאתה עוזר לו — זה עולם ומלואו.\n\nבברכה ובתודה,\nצוות עמותת יד לקשיש',
      status: 'PENDING',
      month: 3,
      year: 2026,
    },
  })

  console.log('Seeding monthly report (March 2026)...')

  await prisma.monthlyReport.create({
    data: {
      month: 3,
      year: 2026,
      content: {
        totalOperations: 6,
        totalVolunteers: 8,
        totalDonations: 8100,
        donorCount: 5,
        highlights: [
          'אירוע פורים מוצלח עם 12 קשישים',
          'חלוקת מזון ערב פסח ל-40 קשישים',
          'סיוע בקניות ובניקיון לפסח ל-18 משפחות',
          'ליווי רפואי ל-10 קשישים',
        ],
      },
      sentAt: daysAgo(3),
    },
  })

  console.log('Seed completed successfully!')
  console.log('Summary:')
  console.log('  Volunteers: 10 (9 active, 1 inactive)')
  console.log('  Donors: 8 (2 cooling, 6 active)')
  console.log('  Operations: 12 total')
  console.log('    - 1 upcoming in 2 days (סדר שני, only suggested) → dashboard alert')
  console.log('    - 1 upcoming in 4 days (ביקורי בית, 2 confirmed)')
  console.log('    - 2 upcoming later in April (חלוקת מזון, ליווי)')
  console.log('    - 2 completed this month (April 1–2, Passover)')
  console.log('    - 6 completed last month (March 2026)')
  console.log('  Donations: 25 total (~₪9,000 this month from 5 donors — Passover season)')
  console.log('  Impact scores: 7 volunteers scored (early April)')
  console.log('  Appreciation letters: 3 pending (top 3 March volunteers)')
  console.log('  Monthly report: 1 sent (March 2026)')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
