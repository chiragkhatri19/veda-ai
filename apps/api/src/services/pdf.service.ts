import PDFDocument from 'pdfkit';
import type { GeneratedQuestionPaper } from '@veda/shared';

const MARGIN = 56;
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard / Challenging',
};

function drawHRule(doc: InstanceType<typeof PDFDocument>, thick = false) {
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(doc.page.width - MARGIN, doc.y)
    .lineWidth(thick ? 1.5 : 0.5)
    .strokeColor('#CCCCCC')
    .stroke()
    .moveDown(0.6);
}

function questionRow(
  doc: InstanceType<typeof PDFDocument>,
  questionNumber: number,
  text: string,
  marks: number,
  difficulty: string,
) {
  const pageWidth = doc.page.width;
  const marksColWidth = 68;
  const qNumWidth = 22;
  const textWidth = pageWidth - MARGIN * 2 - qNumWidth - marksColWidth;

  const startY = doc.y;

  // Question number
  doc
    .fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#111111')
    .text(`${questionNumber}.`, MARGIN, startY, { width: qNumWidth });

  // Question text
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#1A1A1A')
    .text(text, MARGIN + qNumWidth, startY, { width: textWidth, lineGap: 2 });

  const afterTextY = doc.y;

  // Marks + difficulty (right column, aligned with start of question)
  const diffLabel = DIFFICULTY_LABELS[difficulty] ?? difficulty;
  doc
    .fontSize(9)
    .font('Helvetica-Bold')
    .fillColor('#374151')
    .text(
      `[${marks} ${marks === 1 ? 'mark' : 'marks'}]`,
      pageWidth - MARGIN - marksColWidth,
      startY,
      { width: marksColWidth, align: 'right' },
    );
  doc
    .fontSize(8)
    .font('Helvetica')
    .fillColor('#6B7280')
    .text(
      diffLabel,
      pageWidth - MARGIN - marksColWidth,
      startY + 14,
      { width: marksColWidth, align: 'right' },
    );

  // Advance cursor past the question block
  doc.y = Math.max(afterTextY, startY + 26) + 10;
}

export async function generateQuestionPaperPDF(
  paper: GeneratedQuestionPaper,
  assignmentTitle: string,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: MARGIN, size: 'A4', autoFirstPage: true });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const pageW = doc.page.width;
    const contentW = pageW - MARGIN * 2;

    // ─── Header ────────────────────────────────────────────────────────
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor('#888888')
      .text('QUESTION PAPER', MARGIN, MARGIN, { width: contentW, align: 'center' });

    doc.moveDown(0.3);

    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .fillColor('#111111')
      .text(paper.schoolName, { width: contentW, align: 'center' });

    doc.moveDown(0.2);

    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#374151')
      .text(`${assignmentTitle}`, { width: contentW, align: 'center' });

    doc.moveDown(0.4);

    // Subject / Grade row
    doc
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#374151')
      .text(
        `Subject: ${paper.subject}   |   Class / Grade: ${paper.grade}`,
        { width: contentW, align: 'center' },
      );

    doc.moveDown(0.3);

    // Time / Marks row — both columns start at the same Y
    const rowY = doc.y;
    const timeText = `Time Allowed: ${paper.timeAllowed}`;
    const marksText = `Maximum Marks: ${paper.maximumMarks}`;
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111')
      .text(timeText, MARGIN, rowY, { width: contentW / 2 });
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#111111')
      .text(marksText, MARGIN, rowY, { width: contentW, align: 'right' });
    doc.y = rowY + 18;

    doc.moveDown(0.4);

    // Thick rule under header
    doc
      .moveTo(MARGIN, doc.y)
      .lineTo(pageW - MARGIN, doc.y)
      .lineWidth(2)
      .strokeColor('#111111')
      .stroke()
      .moveDown(0.6);

    // ─── General Instructions ──────────────────────────────────────────
    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#111111')
      .text('General Instructions:', MARGIN);

    doc.moveDown(0.2);

    const instructions = [
      `This paper contains ${paper.totalQuestions} question${paper.totalQuestions !== 1 ? 's' : ''} carrying ${paper.maximumMarks} marks.`,
      'All questions are compulsory unless stated otherwise.',
      'Marks are indicated in brackets against each question.',
      'Write answers neatly and legibly.',
    ];

    instructions.forEach((inst) => {
      doc
        .fontSize(9)
        .font('Helvetica')
        .fillColor('#374151')
        .text(`•  ${inst}`, MARGIN + 8, doc.y, { width: contentW - 8 });
    });

    doc.moveDown(0.6);

    // ─── Student Info ──────────────────────────────────────────────────
    const lineY = doc.y;
    const lineH = 18;

    doc.fontSize(9).font('Helvetica-Bold').fillColor('#111111').text('Name:', MARGIN, lineY + 3);
    doc
      .moveTo(MARGIN + 36, lineY + lineH)
      .lineTo(MARGIN + 210, lineY + lineH)
      .lineWidth(0.8)
      .strokeColor('#444444')
      .stroke();

    doc.text('Roll No.:', MARGIN + 225, lineY + 3);
    doc
      .moveTo(MARGIN + 264, lineY + lineH)
      .lineTo(MARGIN + 340, lineY + lineH)
      .stroke();

    doc.text('Section:', MARGIN + 355, lineY + 3);
    doc
      .moveTo(MARGIN + 392, lineY + lineH)
      .lineTo(MARGIN + 460, lineY + lineH)
      .stroke();

    doc.y = lineY + lineH + 14;
    doc.moveDown(0.4);

    drawHRule(doc);

    // ─── Sections ─────────────────────────────────────────────────────
    paper.sections.forEach((section, sIdx) => {
      // Section header
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#111111')
        .text(
          `SECTION ${section.label}: ${section.title.toUpperCase()}`,
          { width: contentW, align: 'center' },
        );

      doc.moveDown(0.2);

      doc
        .fontSize(9)
        .font('Helvetica-Oblique')
        .fillColor('#555555')
        .text(section.instruction, { width: contentW, align: 'center' });

      doc.moveDown(0.6);

      // Questions
      section.questions.forEach((q) => {
        // New page if too close to bottom
        if (doc.y > doc.page.height - MARGIN - 60) {
          doc.addPage();
        }

        questionRow(doc, q.questionNumber, q.text, q.marks, q.difficulty);
      });

      // Divider between sections (not after last)
      if (sIdx < paper.sections.length - 1) {
        doc.moveDown(0.4);
        drawHRule(doc, true);
        doc.moveDown(0.2);
      }
    });

    // ─── Footer ───────────────────────────────────────────────────────
    doc.moveDown(1);

    doc
      .moveTo(MARGIN, doc.y)
      .lineTo(pageW - MARGIN, doc.y)
      .lineWidth(1.5)
      .strokeColor('#111111')
      .stroke()
      .moveDown(0.5);

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor('#111111')
      .text('*** END OF QUESTION PAPER ***', { width: contentW, align: 'center' });

    doc.end();
  });
}
