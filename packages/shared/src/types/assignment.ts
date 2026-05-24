export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface QuestionTypeConfig {
  type: string;
  count: number;
  marksPerQuestion: number;
}

export type DiagramType = 'line' | 'bar' | 'scatter';

export interface DiagramDataPoint {
  name: string;
  value: number;
}

export interface DiagramData {
  type: DiagramType;
  title: string | null;
  xLabel: string | null;
  yLabel: string | null;
  data: DiagramDataPoint[];
}

export interface GeneratedQuestion {
  id: string;
  questionNumber: number;
  text: string;
  type: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  marks: number;
  answer: string | null;
  hint: string | null;
  diagramDescription: string | null;
  diagramData: DiagramData | null;
}

export interface GeneratedSection {
  id: string;
  label: string;
  title: string;
  instruction: string;
  totalMarks: number;
  questions: GeneratedQuestion[];
}

export interface GeneratedQuestionPaper {
  schoolName: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  maximumMarks: number;
  totalQuestions: number;
  generatedAt: string;
  sections: GeneratedSection[];
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  groupId: string | null;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string | null;
  uploadedFileText: string | null;
  jobStatus: JobStatus;
  questionPaper: GeneratedQuestionPaper | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentInput {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  schoolName?: string | null;
  groupId?: string | null;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions?: string | null;
  uploadedFileText?: string | null;
}

export interface JobProgressEvent {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  result?: GeneratedQuestionPaper;
  error?: string;
}
