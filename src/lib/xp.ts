import type { XPAction, Tier, AvatarStage, Badge } from '@/types/gamification';

export const XP_VALUES: Record<XPAction, number> = {
  COMPLETE_SUBTOPIC: 10,
  COMPLETE_TOPIC: 50,
  COMPLETE_UNIT: 100,
  COMPLETE_COURSE: 200,
  PERFECT_QUIZ: 150,
  QUIZ_COMPLETE: 30,
  DAILY_LOGIN: 15,
};

export function getLevelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function getTierFromLevel(level: number): Tier {
  if (level >= 36) return 'Diamond';
  if (level >= 21) return 'Platinum';
  if (level >= 11) return 'Gold';
  if (level >= 6) return 'Silver';
  return 'Bronze';
}

export function getAvatarStageFromLevel(level: number): AvatarStage {
  if (level >= 36) return 4;
  if (level >= 21) return 3;
  if (level >= 11) return 2;
  if (level >= 5) return 1;
  return 0;
}

export function getXPForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function getXPForNextLevel(level: number): number {
  return level * level * 100;
}

export const BADGE_DEFINITIONS: Badge[] = [
  {
    id: 'FIRST_LESSON',
    name: 'First Lesson',
    description: 'Completed your first subtopic',
    icon: '🎯',
    condition: 'Complete 1 subtopic',
  },
  {
    id: 'WEEK_STREAK',
    name: 'Week Warrior',
    description: '7-day learning streak',
    icon: '🔥',
    condition: '7-day streak',
  },
  {
    id: 'QUIZ_MASTER',
    name: 'Quiz Master',
    description: 'Scored 100% on 3 quizzes',
    icon: '🏆',
    condition: '3 perfect quizzes',
  },
  {
    id: 'COURSE_GRADUATE',
    name: 'Course Graduate',
    description: 'Completed an entire course',
    icon: '🎓',
    condition: 'Complete 1 course',
  },
  {
    id: 'KNOWLEDGE_SHARER',
    name: 'Knowledge Sharer',
    description: 'Published a course publicly',
    icon: '📢',
    condition: 'Publish 1 course',
  },
  {
    id: 'SPEED_LEARNER',
    name: 'Speed Learner',
    description: 'Completed 10 subtopics in one day',
    icon: '⚡',
    condition: '10 subtopics in 1 day',
  },
  {
    id: 'CRICKET_GURU',
    name: 'Cricket Guru',
    description: 'Learned 20 concepts through cricket',
    icon: '🏏',
    condition: '20 cricket explanations',
  },
  {
    id: 'ANIME_SCHOLAR',
    name: 'Anime Scholar',
    description: 'Learned 20 concepts through anime',
    icon: '⛩️',
    condition: '20 anime explanations',
  },
  {
    id: 'MULTILINGUAL',
    name: 'Multilingual Learner',
    description: 'Learned in 2+ languages',
    icon: '🌍',
    condition: 'Use 2+ languages',
  },
];

export const LEVEL_UP_MESSAGES: Record<string, string> = {
  cricket: 'You just hit a six in the knowledge game. Keep going!',
  movies: 'Your story just got a new chapter. What happens next?',
  anime: 'You powered up. Your next arc begins now.',
  gaming: 'Achievement unlocked. Next level loading...',
  football: 'You scored a screamer! Hat-trick incoming.',
  f1: 'Fastest lap in the knowledge race. Keep pushing.',
  music: 'New verse unlocked. The chorus is just ahead.',
  tvshows: 'Next episode unlocked. The plot thickens.',
};
