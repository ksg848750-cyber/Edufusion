import { Timestamp } from 'firebase/firestore';

export type CourseSource = 'syllabus_upload' | 'ai_generated';

export interface Course {
  courseId: string;
  userId: string;
  title: string;
  subject: string;
  source: CourseSource;
  totalUnits: number;
  createdAt: Timestamp;
}

export interface Unit {
  unitId: string;
  courseId: string;
  userId: string;
  title: string;
  order: number;
  isCompleted: boolean;
  completedAt: Timestamp | null;
}

export interface Topic {
  topicId: string;
  unitId: string;
  courseId: string;
  userId: string;
  title: string;
  order: number;
  isCompleted: boolean;
  completedAt: Timestamp | null;
}

export interface Subtopic {
  subtopicId: string;
  topicId: string;
  unitId: string;
  courseId: string;
  userId: string;
  title: string;
  order: number;
  isCompleted: boolean;
  cachedExplanations: Record<string, unknown>;
  completedAt: Timestamp | null;
}

export interface Progress {
  userId: string;
  courseId: string;
  completedSubtopics: string[];
  completedTopics: string[];
  completedUnits: string[];
  progressPercentage: number;
  lastSubtopicId: string;
  lastTopicId: string;
  lastUnitId: string;
  updatedAt: Timestamp;
}

export interface PublicCourse {
  originalCourseId: string;
  authorId: string;
  authorName: string;
  title: string;
  cloneCount: number;
  publishedAt: Timestamp;
}

export interface CourseStructure {
  courseTitle: string;
  units: {
    unitTitle: string;
    topics: {
      topicTitle: string;
      subtopics: string[];
    }[];
  }[];
}
