import PDFDocument from 'pdfkit'
import path from 'path'

interface ReportPDFParams {
  month: number
  year: number
  orgName: string
  narrative: string
  operationCount: number
  volunteerCount: number
  totalDonations: number
  donorCount: number
  operations: { title: string; volunteerCount: number }[]
}

const MONTH_NAMES_HE = [
  '', 'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר',
]

const HEEBO_FONT = path.join(process.cwd(), 'public', 'fonts', 'Heebo.ttf')

export async function generateReportPDF(params: ReportPDFParams): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', chunk => chunks.push(chunk as Buffer))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    doc.registerFont('Heebo', HEEBO_FONT)

    const monthName = MONTH_NAMES_HE[params.month] ?? String(params.month)

    // Header
    doc
      .fontSize(22)
      .font('Heebo')
      .text(params.orgName, { align: 'center' })
      .moveDown(0.3)

    doc
      .fontSize(16)
      .font('Heebo')
      .text(`דוח חודשי — ${monthName} ${params.year}`, { align: 'center' })
      .moveDown(1)

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#dde3ec')
      .stroke()
      .moveDown(0.8)

    // Stats row
    const stats = [
      { label: 'מבצעים', value: String(params.operationCount) },
      { label: 'מתנדבים', value: String(params.volunteerCount) },
      { label: 'תורמים', value: String(params.donorCount) },
      { label: 'תרומות', value: `${params.totalDonations.toLocaleString('he-IL')}₪` },
    ]

    const boxWidth = 110
    const boxHeight = 55
    const startX = 55
    const startY = doc.y

    stats.forEach((stat, i) => {
      const x = startX + i * (boxWidth + 10)
      doc.rect(x, startY, boxWidth, boxHeight).strokeColor('#dde3ec').stroke()
      doc.fontSize(18).font('Heebo').text(stat.value, x, startY + 8, { width: boxWidth, align: 'center' })
      doc.fontSize(9).font('Heebo').text(stat.label, x, startY + 34, { width: boxWidth, align: 'center' })
    })

    doc.y = startY + boxHeight + 20

    // Operations list
    doc
      .fontSize(13)
      .font('Heebo')
      .text('מבצעים החודש', { align: 'right' })
      .moveDown(0.5)

    params.operations.forEach(op => {
      doc
        .fontSize(10)
        .font('Heebo')
        .text(`${op.title} — ${op.volunteerCount} מתנדבים`, { align: 'right' })
    })

    doc.moveDown(1)

    // Divider
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor('#dde3ec')
      .stroke()
      .moveDown(0.8)

    // Narrative
    doc
      .fontSize(13)
      .font('Heebo')
      .text('דוח מנהלי', { align: 'right' })
      .moveDown(0.5)

    doc
      .fontSize(10)
      .font('Heebo')
      .text(params.narrative, { align: 'right', lineGap: 4 })

    // Footer
    const footerY = doc.page.height - 60
    doc
      .fontSize(8)
      .fillColor('#94a3b8')
      .font('Heebo')
      .text(
        'הופק אוטומטית ע"י מערכת ניהול העמותה',
        50,
        footerY,
        { align: 'center', width: 495 }
      )

    doc.end()
  })
}
