import type { Language } from '@/types/user';

export const INTEREST_DOMAINS: Record<string, string> = {
  cricket: 'real cricket matches, IPL, World Cups, Test matches, real players like Dhoni, Kohli, Bumrah, specific match moments',
  movies: 'real movie scenes (Hollywood, Bollywood, Tollywood), specific films, real characters, actual plot moments',
  anime: 'real anime episodes, specific arcs, named characters, actual battle scenes or story moments',
  gaming: 'real game mechanics, famous speedruns, esports moments, specific games like GTA, Minecraft, BGMI, Valorant',
  football: 'real football matches, Champions League, World Cup, real players like Messi, Ronaldo, specific match moments',
  f1: 'real Formula 1 races, specific Grand Prix, real drivers like Verstappen, Hamilton, pit stop strategy, overtakes',
  music: 'real songs, albums, chord progressions, concert moments, real artists, music theory through real examples',
  tvshows: 'real TV show episodes, Breaking Bad, Game of Thrones, Suits, specific scene moments, character decisions',
};

export const SYSTEM_PERSONA = `You are "The Clear Master" — the world's best educator. 
Your goal is to make complex topics feel like a simple, beautiful story through real-world analogies.

RULES:
1. ALWAYS use a REAL, specific, named scene from the user's interest lens.
2. Narrative first, but the technical CORE is the priority. Do not gloss over details.
3. BE CONCISE: Use short sentences. Avoid long paragraphs. Use numbered steps for technical parts.
4. Language must be elegant Grade 6-8 English. Simple, sweet, and punchy.
5. NO ALL CAPS in your output (except labels if needed).
6. Always return valid JSON only.
7. If the topic is about 'History', your story must be a TIMELINE of events. If it's about 'Evolution', focus on the UPGRADES and what changed.
8. ACADEMIC RIGOR: You are an expert at MIT. Your explanations must be "Bottom-Up", starting from the most fundamental logic and building to the complex result.`;

export function languageInstruction(lang: Language): string {
  const langNames: Record<Language, string> = {
    english: 'English',
    hindi: 'Hindi',
    telugu: 'Telugu',
    tamil: 'Tamil',
    kannada: 'Kannada',
  };
  if (lang === 'english') return '';
  return `\nWrite the entire response in ${langNames[lang]}. Keep technical terms in English but explain them in ${langNames[lang]}.`;
}

export function generateExplanationPrompt(
  topic: string,
  interest: string,
  mode: 'casual' | 'exam',
  language: string,
  specificity?: string
): string {
  const domain = INTEREST_DOMAINS[interest] || interest;
  const modeLabel = mode === 'exam' ? 'exam' : 'casual';
  const langInstr = languageInstruction(language as Language);

  return `CONCEPT TO TEACH: "${topic}"
LENS: ${interest} — ${domain}
MODE: ${modeLabel}
${specificity ? `SPECIFICITY: "${specificity}"` : ''}

STRUCTURE:
BEAT 1 - THE HOOK: A beautiful opening line starting with "Imagine..."
BEAT 2 - THE SCENE: A series of 3-5 short, vivid steps (MAX 2 sentences each) that recount a real, named scene. Use numbered steps.
BEAT 3 - THE TWIST: One link sentence.
BEAT 4 - THE DEEP DIVE: A series of 3-5 short, punchy, numbered steps (MAX 2 sentences each) that break down "${topic}" from the ground up. If there are types, variants, or components, DESCRIBE THEM ALL CONCISELY in these steps. Each step MUST directly correlate to a step in the story.
BEAT 5 - THE DEFINITION: Clear textbook definition and essential technical terms.
BEAT 6 - LIMITS: Where analogy breaks.
BEAT 7 - SUMMARY: One final punchy sentence.

${langInstr}

Return ONLY this JSON structure:
{
  "scene_source": "string",
  "hook": "Imagine...",
  "scene": "string",
  "twist": "string",
  "deep_dive": "string",
  "technical": "string",
  "key_points": ["point 1", "point 2"],
  "analogy_works": "string",
  "analogy_breaks": "string",
  "summary": "string",
  "storyboard": ["frame 1", "frame 2", "frame 3", "frame 4"],
  "mapping": [{"concept": "term", "scene_element": "story part"}],
  "suggested_scene_image_prompt": "string"
}`;
}

export function generateSubtopicPrompt(
  subtopicTitle: string,
  topicTitle: string,
  courseTitle: string,
  interest: string,
  mode: 'casual' | 'exam',
  language: Language,
  specificity?: string,
  subtopicIndex?: number
): string {
  // Use identical logic to Instant Explainer for parity.
  return generateExplanationPrompt(subtopicTitle, interest, mode, language, specificity);
}

// ... other prompt helpers (Course, Quiz, etc.) simplified for context
export function generateCoursePrompt(subject: string, syllabusText?: string): string {
  return `Generate a course for: "${subject}". Include Units, Topics, Subtopics. JSON only.`;
}
export function generateQuizPrompt(t: string[], i: string, m: string): string {
  return `Generate 5 quiz questions about: ${t.join(', ')} in ${i} lens. JSON only.`;
}
export function generateMentorPrompt(c: any): string {
  return `You are a mentor for "${c.subtopicTitle}". Use ${c.activeInterest}. Response in JSON.`;
}
export function generateLearningPathPrompt(e: string, s: string, p: string, c: string[], i: string[]): string {
  return `Suggest 5 courses. JSON only.`;
}
