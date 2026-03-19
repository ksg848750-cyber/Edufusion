import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const INTEREST_EMOJIS: Record<string, string> = {
  cricket: '🏏',
  movies: '🎬',
  anime: '🗾',
  gaming: '🎮',
  football: '⚽',
  f1: '🏎️',
  music: '🎵',
  tvshows: '📺',
};

export const INTEREST_LABELS: Record<string, string> = {
  cricket: 'Cricket',
  movies: 'Movies',
  anime: 'Anime',
  gaming: 'Gaming',
  football: 'Football',
  f1: 'F1',
  music: 'Music',
  tvshows: 'TV Shows',
};

export const INTEREST_TEASERS: Record<string, string> = {
  cricket: 'Real matches. Real moments.',
  movies: 'Real scenes. Real characters.',
  anime: 'Real episodes. Real arcs.',
  gaming: 'Real games. Real mechanics.',
  football: 'Real matches. Real tactics.',
  f1: 'Real races. Real overtakes.',
  music: 'Real songs. Real theory.',
  tvshows: 'Real episodes. Real drama.',
};

export const ALL_INTERESTS = [
  'cricket',
  'movies',
  'anime',
  'gaming',
  'football',
  'f1',
  'music',
  'tvshows',
] as const;

export type Interest = (typeof ALL_INTERESTS)[number];
