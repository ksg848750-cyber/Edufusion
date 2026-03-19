import { Timestamp } from 'firebase/firestore';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Timestamp;
}

export interface MentorChat {
  chatId: string;
  userId: string;
  courseId: string;
  topicId: string;
  subtopicId: string;
  messages: ChatMessage[];
  chatSummary: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
