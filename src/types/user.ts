import { Timestamp } from 'firebase/firestore';

export type Language = 'english' | 'hindi' | 'telugu' | 'tamil' | 'kannada';
export type EducationLevel = 'school' | 'undergraduate' | 'postgraduate' | 'professional';
export type LearningMode = 'casual' | 'exam';
export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  interests: string[];
  language: Language;
  educationLevel: EducationLevel;
  studyClass: string;
  profession: string;
  preferredMode: LearningMode;
  currentCourseId: string;
  xp: number;
  level: number;
  tier: Tier;
  avatarStage: number;
  streakDays: number;
  lastActiveDate: Timestamp;
  createdAt: Timestamp;
  isOnboarded: boolean;
  badges?: { id: string; timestamp?: Timestamp }[];
}

export interface UserStats {
  uid: string;
  xp: number;
  level: number;
  tier: Tier;
  avatarStage: number;
  streakDays: number;
  totalCoursesCompleted: number;
  totalTopicsCompleted: number;
  totalQuizzesTaken: number;
  badges: string[];
}
