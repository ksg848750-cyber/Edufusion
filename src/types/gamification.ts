export type XPAction =
  | 'COMPLETE_SUBTOPIC'
  | 'COMPLETE_TOPIC'
  | 'COMPLETE_UNIT'
  | 'COMPLETE_COURSE'
  | 'PERFECT_QUIZ'
  | 'QUIZ_COMPLETE'
  | 'FAIL_SUBTOPIC_QUIZ'
  | 'FAIL_TOPIC_QUIZ'
  | 'FAIL_UNIT_QUIZ'
  | 'FAIL_COURSE_QUIZ'
  | 'DAILY_LOGIN';

export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export type AvatarStage = 0 | 1 | 2 | 3 | 4;

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
}

export interface LeaderboardEntry {
  userId: string;
  name: string;
  xp: number;
  level: number;
  tier: Tier;
  weeklyXP: number;
  avatarStage: AvatarStage;
  updatedAt: Date;
}

export interface LevelUpResult {
  newXP: number;
  newLevel: number;
  newTier: Tier;
  newAvatarStage: AvatarStage;
  leveledUp: boolean;
  badgesUnlocked: Badge[];
}
