import { z } from 'zod';

const languageEnum = z.enum(['english', 'hindi', 'telugu', 'tamil', 'kannada']);
const modeEnum = z.enum(['casual', 'exam']);

export const explainSchema = z.object({
  topic: z.string().min(1).max(500),
  interest: z.string().min(1).max(100),
  mode: modeEnum,
  language: languageEnum,
  specificity: z.string().max(500).optional(),
});

export const generateCourseSchema = z.object({
  subject: z.string().min(1).max(500),
  syllabusText: z.string().max(10000).optional(),
});

export const generateSubtopicExplanationSchema = z.object({
  subtopicId: z.string().min(1),
  subtopicTitle: z.string().min(1),
  topicTitle: z.string().min(1),
  courseTitle: z.string().min(1),
  interest: z.string().min(1),
  mode: modeEnum,
  language: languageEnum,
  specificity: z.string().max(500).optional(),
  subtopicIndex: z.number().int().min(0).optional(),
});

export const generateQuizSchema = z.object({
  type: z.enum(['subtopic', 'topic', 'unit', 'course']),
  referenceId: z.string().min(1),
  interest: z.string().min(1).max(100),
  mode: modeEnum.default('casual'),
});

export const mentorChatSchema = z.object({
  message: z.string().min(1).max(2000),
  courseId: z.string().optional(),
  topicId: z.string().optional(),
  subtopicId: z.string().optional(),
  subtopicTitle: z.string().optional(), // Fallback for Quick Explain
  activeInterest: z.string().min(1).max(100),
});

export const voiceSchema = z.object({
  text: z.string().min(1).max(5000),
  language: languageEnum,
});

export const sceneImageSchema = z.object({
  sceneDescription: z.string().min(1).max(1000),
  concept: z.string().min(1).max(200),
  interest: z.string().min(1).max(100),
  sceneSource: z.string().max(500).optional(),
});

export const xpAwardSchema = z.object({
  action: z.enum([
    'COMPLETE_SUBTOPIC',
    'COMPLETE_TOPIC',
    'COMPLETE_UNIT',
    'COMPLETE_COURSE',
    'PERFECT_QUIZ',
    'QUIZ_COMPLETE',
    'FAIL_SUBTOPIC_QUIZ',
    'FAIL_TOPIC_QUIZ',
    'FAIL_UNIT_QUIZ',
    'FAIL_COURSE_QUIZ',
    'DAILY_LOGIN',
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const progressUpdateSchema = z.object({
  courseId: z.string().min(1),
  subtopicId: z.string().min(1),
  topicId: z.string().optional(),
  unitId: z.string().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  interests: z.array(z.string()).min(1).max(5).optional(),
  language: languageEnum.optional(),
  educationLevel: z.enum(['school', 'undergraduate', 'postgraduate', 'professional']).optional(),
  studyClass: z.string().max(50).optional(),
  profession: z.string().max(100).optional(),
  preferredMode: modeEnum.optional(),
  isOnboarded: z.boolean().optional(),
  photoURL: z.string().optional(),
});

export const explanationRequestSchema = z.object({
  topic: z.string().min(1),
  interest: z.string().min(1),
  mode: z.enum(['casual', 'exam']),
  language: z.string().default('english'),
  specificContext: z.string().optional(),
});
