/**
 * Seed script — populates MongoDB with demo assignments so the app is
 * reviewable without running a real AI generation job.
 *
 * Usage: pnpm --filter @veda/api seed
 */
import mongoose from 'mongoose';
import { Assignment } from '../models/assignment.model.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const DEMO_ASSIGNMENTS = [
  {
    title: 'Chapter 3 – Algebra Mid-Unit Test',
    subject: 'Mathematics',
    grade: '8',
    dueDate: '2026-06-15',
    groupId: null,
    questionTypes: [
      { type: 'multiple_choice', count: 5, marksPerQuestion: 1 },
      { type: 'short_answer', count: 4, marksPerQuestion: 3 },
      { type: 'long_answer', count: 2, marksPerQuestion: 5 },
    ],
    additionalInstructions: 'Focus on linear equations and basic geometry.',
    uploadedFileText: null,
    jobStatus: 'completed' as const,
    questionPaper: {
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'Mathematics',
      grade: '8',
      timeAllowed: '1 hour 30 minutes',
      maximumMarks: 27,
      totalQuestions: 11,
      generatedAt: new Date('2026-05-10T09:30:00.000Z').toISOString(),
      sections: [
        {
          id: 'sec-a',
          label: 'A',
          title: 'Multiple Choice Questions',
          instruction: 'Choose the correct option. Each question carries 1 mark.',
          totalMarks: 5,
          questions: [
            { id: 'q1', questionNumber: 1, text: 'The solution to 2x + 6 = 14 is:', type: 'multiple_choice', difficulty: 'easy', marks: 1, answer: 'x = 4', hint: null },
            { id: 'q2', questionNumber: 2, text: 'Which of the following is a linear equation in one variable?', type: 'multiple_choice', difficulty: 'easy', marks: 1, answer: '2x + 3 = 7', hint: null },
            { id: 'q3', questionNumber: 3, text: 'If 3x − 9 = 0, then x equals:', type: 'multiple_choice', difficulty: 'easy', marks: 1, answer: 'x = 3', hint: null },
            { id: 'q4', questionNumber: 4, text: 'The equation 4(x + 2) = 20 simplifies to:', type: 'multiple_choice', difficulty: 'moderate', marks: 1, answer: 'x = 3', hint: null },
            { id: 'q5', questionNumber: 5, text: 'A number is 5 more than twice another number. If the smaller number is 3, the larger number is:', type: 'multiple_choice', difficulty: 'moderate', marks: 1, answer: '11', hint: null },
          ],
        },
        {
          id: 'sec-b',
          label: 'B',
          title: 'Short Answer Questions',
          instruction: 'Answer each question briefly. Each carries 3 marks.',
          totalMarks: 12,
          questions: [
            { id: 'q6', questionNumber: 6, text: 'Solve for x: 5x − 3 = 2x + 9', type: 'short_answer', difficulty: 'easy', marks: 3, answer: 'x = 4', hint: 'Move variables to one side' },
            { id: 'q7', questionNumber: 7, text: 'The perimeter of a rectangle is 54 cm. If the length is 15 cm, find the breadth.', type: 'short_answer', difficulty: 'moderate', marks: 3, answer: 'Breadth = 12 cm', hint: 'Use P = 2(l + b)' },
            { id: 'q8', questionNumber: 8, text: 'A train travels at 60 km/h. Write an equation for the distance d after t hours, then find d when t = 2.5.', type: 'short_answer', difficulty: 'moderate', marks: 3, answer: 'd = 60t; d = 150 km', hint: null },
            { id: 'q9', questionNumber: 9, text: 'Solve: (x/3) + 4 = 9', type: 'short_answer', difficulty: 'hard', marks: 3, answer: 'x = 15', hint: null },
          ],
        },
        {
          id: 'sec-c',
          label: 'C',
          title: 'Long Answer Questions',
          instruction: 'Show all working clearly. Each carries 5 marks.',
          totalMarks: 10,
          questions: [
            { id: 'q10', questionNumber: 10, text: 'The sum of three consecutive even numbers is 78. Find the numbers and verify your answer.', type: 'long_answer', difficulty: 'moderate', marks: 5, answer: 'Let numbers be n, n+2, n+4. Then n + (n+2) + (n+4) = 78 → 3n + 6 = 78 → n = 24. Numbers: 24, 26, 28.', hint: null },
            { id: 'q11', questionNumber: 11, text: "Two friends Ravi and Priya have a total of ₹1200. Ravi has ₹200 more than twice Priya's amount. How much does each have? Formulate and solve.", type: 'long_answer', difficulty: 'hard', marks: 5, answer: "Let Priya have ₹x. Ravi has ₹(2x + 200). x + 2x + 200 = 1200 → 3x = 1000 → x ≈ 333.33. Priya: ₹333.33, Ravi: ₹866.67.", hint: null },
          ],
        },
      ],
    },
  },
  {
    title: 'Life Processes – Formative Assessment 2',
    subject: 'Biology',
    grade: '10',
    dueDate: '2026-06-20',
    groupId: null,
    questionTypes: [
      { type: 'true_false', count: 5, marksPerQuestion: 1 },
      { type: 'short_answer', count: 5, marksPerQuestion: 2 },
      { type: 'long_answer', count: 2, marksPerQuestion: 5 },
    ],
    additionalInstructions: null,
    uploadedFileText: null,
    jobStatus: 'completed' as const,
    questionPaper: {
      schoolName: 'Delhi Public School, Sector-4, Bokaro',
      subject: 'Biology',
      grade: '10',
      timeAllowed: '1 hour 30 minutes',
      maximumMarks: 25,
      totalQuestions: 12,
      generatedAt: new Date('2026-05-12T11:00:00.000Z').toISOString(),
      sections: [
        {
          id: 'sec-a',
          label: 'A',
          title: 'True or False',
          instruction: 'Write T for True and F for False. Each carries 1 mark.',
          totalMarks: 5,
          questions: [
            { id: 'q1', questionNumber: 1, text: 'Photosynthesis takes place in the chloroplast of plant cells.', type: 'true_false', difficulty: 'easy', marks: 1, answer: 'True', hint: null },
            { id: 'q2', questionNumber: 2, text: 'Anaerobic respiration in humans produces lactic acid.', type: 'true_false', difficulty: 'easy', marks: 1, answer: 'True', hint: null },
            { id: 'q3', questionNumber: 3, text: 'Stomata open during the night to absorb carbon dioxide.', type: 'true_false', difficulty: 'moderate', marks: 1, answer: 'False – stomata generally open during the day', hint: null },
            { id: 'q4', questionNumber: 4, text: 'The enzyme pepsin is produced in the pancreas.', type: 'true_false', difficulty: 'moderate', marks: 1, answer: 'False – pepsin is produced in the stomach (gastric glands)', hint: null },
            { id: 'q5', questionNumber: 5, text: 'Haemoglobin is found in red blood cells and carries oxygen.', type: 'true_false', difficulty: 'easy', marks: 1, answer: 'True', hint: null },
          ],
        },
        {
          id: 'sec-b',
          label: 'B',
          title: 'Short Answer Questions',
          instruction: 'Answer each question in 2–3 sentences. Each carries 2 marks.',
          totalMarks: 10,
          questions: [
            { id: 'q6', questionNumber: 6, text: 'State the raw materials required for photosynthesis.', type: 'short_answer', difficulty: 'easy', marks: 2, answer: 'Carbon dioxide (CO₂) and water (H₂O) are the raw materials. Sunlight and chlorophyll are also needed.', hint: null },
            { id: 'q7', questionNumber: 7, text: 'Differentiate between aerobic and anaerobic respiration.', type: 'short_answer', difficulty: 'moderate', marks: 2, answer: 'Aerobic: uses oxygen, produces CO₂ + H₂O + energy (38 ATP). Anaerobic: no oxygen; produces lactic acid (animals) or ethanol + CO₂ (yeast).', hint: null },
            { id: 'q8', questionNumber: 8, text: 'What is the role of bile juice in digestion?', type: 'short_answer', difficulty: 'moderate', marks: 2, answer: 'Bile emulsifies fats (breaks large fat globules into smaller ones), increasing the surface area for lipase to act on.', hint: null },
            { id: 'q9', questionNumber: 9, text: 'Name the blood vessels that carry oxygenated blood.', type: 'short_answer', difficulty: 'easy', marks: 2, answer: 'Arteries carry oxygenated blood (except the pulmonary artery). The pulmonary vein is the exception — it carries oxygenated blood from lungs to heart.', hint: null },
            { id: 'q10', questionNumber: 10, text: 'Why is the small intestine so long?', type: 'short_answer', difficulty: 'moderate', marks: 2, answer: 'The length (about 6–7 m) provides a large surface area for digestion and absorption of nutrients, aided by villi and microvilli.', hint: null },
          ],
        },
        {
          id: 'sec-c',
          label: 'C',
          title: 'Long Answer Questions',
          instruction: 'Answer in detail with labelled diagrams wherever necessary. Each carries 5 marks.',
          totalMarks: 10,
          questions: [
            { id: 'q11', questionNumber: 11, text: 'Describe the process of photosynthesis. Include the light-dependent and light-independent reactions, and write the overall chemical equation.', type: 'long_answer', difficulty: 'hard', marks: 5, answer: 'Overall: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂. Light reactions (thylakoid): water is split (photolysis), O₂ released, ATP & NADPH formed. Dark reactions / Calvin Cycle (stroma): CO₂ fixed using ATP & NADPH to produce glucose.', hint: null },
            { id: 'q12', questionNumber: 12, text: 'Draw and label a diagram of the human heart. Trace the path of blood through the heart, distinguishing between pulmonary and systemic circulation.', type: 'long_answer', difficulty: 'hard', marks: 5, answer: 'Deoxygenated blood: right atrium → right ventricle → pulmonary artery → lungs (gaseous exchange) → pulmonary vein → left atrium. Oxygenated blood: left atrium → left ventricle → aorta → body → vena cava → right atrium. [Diagram required]', hint: null },
          ],
        },
      ],
    },
  },
  {
    title: 'French Revolution – History Unit Test',
    subject: 'History',
    grade: '9',
    dueDate: '2026-06-25',
    groupId: null,
    questionTypes: [
      { type: 'multiple_choice', count: 5, marksPerQuestion: 1 },
      { type: 'short_answer', count: 3, marksPerQuestion: 3 },
    ],
    additionalInstructions: null,
    uploadedFileText: null,
    jobStatus: 'queued' as const,
    questionPaper: null,
  },
];

async function seed(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('Connected to MongoDB');

  const existing = await Assignment.countDocuments();
  if (existing > 0) {
    logger.warn(`Database already has ${existing} assignments — skipping seed to avoid duplicates.`);
    logger.info('To force re-seed, drop the assignments collection first: db.assignments.drop()');
    await mongoose.disconnect();
    return;
  }

  await Assignment.insertMany(DEMO_ASSIGNMENTS);
  logger.info(`Seeded ${DEMO_ASSIGNMENTS.length} demo assignments successfully.`);

  await mongoose.disconnect();
  logger.info('Disconnected from MongoDB');
}

seed().catch((err: Error) => {
  logger.error('Seed failed', { message: err.message });
  process.exit(1);
});
