import { Timestamp } from 'firebase/firestore';

export type QuizType = 'subtopic' | 'topic' | 'unit' | 'course';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface QuizResult {
  resultId: string;
  userId: string;
  courseId: string;
  topicId: string | null;
  unitId: string | null;
  type: QuizType;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  questions: QuizQuestion[];
  xpAwarded: number;
  createdAt: Timestamp;
}
