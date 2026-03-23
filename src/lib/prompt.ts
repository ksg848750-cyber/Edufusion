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
BEAT 2 - THE SCENE: A series of 4-8 short, vivid steps (MAX 2 sentences each) that recount a real, named scene. 
BEAT 3 - THE TWIST: One link sentence.
BEAT 4 - THE DEEP DIVE: A series of 4-8 short, punchy steps (MAX 2 sentences each) that break down "${topic}" from the ground up from first principles.
CRITICAL EXHAUSTIVENESS: If "${topic}" refers to a specific list of conditions, types, variants, or rules (e.g. Deadlock Conditions, OSI Layers, ACID, SOLID), you MUST dedicate EXACTLY ONE STEP to EACH ITEM in that list. DO NOT omit any. Explain them ALL.
Prioritize technical completeness over the story mapping.
BEAT 5 - THE DEFINITION: Clear textbook definition and essential technical terms.
BEAT 6 - LIMITS: Where analogy breaks.
BEAT 7 - SUMMARY: One final punchy sentence.

${langInstr}

Return ONLY this JSON structure. 
IMPORTANT: "scene" and "deep_dive" MUST BE ARRAYS OF STRINGS. Each step must be a separate element in the array. NO numbered prefixes (e.g., use "State is saved" instead of "1. State is saved").

{
  "scene_source": "string",
  "hook": "Imagine...",
  "scene": ["step 1", "step 2", "step 3"],
  "twist": "string",
  "deep_dive": ["step 1", "step 2", "step 3"],
  "technical": "string",
  "key_points": ["point 1", "point 2"],
  "analogy_works": "string",
  "analogy_breaks": "string",
  "summary": "string",
  "storyboard": ["frame 1", "frame 2", "frame 3", "frame 4"],
  "mapping": [{"concept": "term", "scene_element": "story part"}],
  "suggested_scene_image_prompt": "string"
}
`;
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
export function generateMentorPrompt(c: {
  subtopicTitle: string;
  topicTitle?: string;
  courseTitle?: string;
  activeInterest: string;
  message: string;
  last8Messages: { role: string; content: string }[];
  chatSummary?: string;
  language?: string;
}): string {
  const context = c.chatSummary ? `Previous Context: ${c.chatSummary}` : '';
  const history = c.last8Messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
  
  return `You are "The Master Mentor", a world-class tutor. 
Your goal is to guide the student through "${c.subtopicTitle}" using their interest in "${c.activeInterest}".

CURRENT CONTEXT:
- Topic: ${c.subtopicTitle} ${c.topicTitle ? `(Part of ${c.topicTitle})` : ''}
- Interest Lens: ${c.activeInterest}
- Language: ${c.language || 'English'}

${context}

CONVERSATION HISTORY:
${history}

STUDENT'S LATEST MESSAGE: "${c.message}"

GUIDELINES:
1. BE CONVERSATIONAL: If the student says "hi", "hello", or just greets you, greet them back warmly and ask how you can help them with ${c.subtopicTitle}. Do NOT jump into a lecture immediately.
2. BE REACTIVE: Only provide detailed explanations or analogies if the student asks a question or expresses confusion. 
3. USE THE LENS: When explaining, use analogies from ${c.activeInterest} naturally.
4. BE CONCISE: Keep responses short and punchy. Avoid long blocks of text unless a deep dive is requested.
5. NO JSON: Use clean, structured Markdown (bolding, lists) but avoid excessive headers.
6. STAY ON TRACK: If they drift too far from the topic, use a ${c.activeInterest} hook to bring them back to ${c.subtopicTitle}.

RESPONSE:`;
}
export function generateLearningPathPrompt(e: string, s: string, p: string, c: string[], i: string[]): string {
  return `Suggest 5 courses. JSON only.`;
}
