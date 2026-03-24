import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { generateQuizSchema } from '@/utils/validate';
import { generateQuizPrompt } from '@/lib/prompt';
import { callGroqJSON } from '@/lib/groq';
import { adminDb } from '@/lib/firebase-admin';
import { getTopicSubtopics, getUnitTopics, getCourseUnits } from '@/lib/course';

interface QuizResponse {
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = generateQuizSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { type, referenceId, interest, mode } = result.data;

    // Gather topic/subtopic titles based on quiz scope
    const topicTitles: string[] = [];

    if (type === 'subtopic') {
      const subtopicDoc = await adminDb.collection('subtopics').doc(referenceId).get();
      if (subtopicDoc.exists) {
        topicTitles.push(subtopicDoc.data()?.title || '');
      }
    } else if (type === 'topic') {
      const topicDoc = await adminDb.collection('topics').doc(referenceId).get();
      if (topicDoc.exists) {
        topicTitles.push(topicDoc.data()?.title || '');
      }
      const subtopics = await getTopicSubtopics(referenceId);
      for (const s of subtopics) {
        const data = s as Record<string, unknown>;
        if (data.title) topicTitles.push(data.title as string);
      }
    } else if (type === 'unit') {
      const topics = await getUnitTopics(referenceId);
      for (const t of topics) {
        const data = t as Record<string, unknown>;
        if (data.title) topicTitles.push(data.title as string);
      }
    } else if (type === 'course') {
      const units = await getCourseUnits(referenceId);
      for (const u of units) {
        const topics = await getUnitTopics(u.id);
        for (const t of topics) {
          const data = t as Record<string, unknown>;
          if (data.title) topicTitles.push(data.title as string);
        }
      }
    }

    if (topicTitles.length === 0) {
      return NextResponse.json(
        { error: 'No topics found for this quiz scope' },
        { status: 404 }
      );
    }

    const prompt = generateQuizPrompt(topicTitles, interest, mode);
    let quizData: any = await callGroqJSON<QuizResponse>(prompt);

    // Groq sometimes returns the JSON object as a string property inside another object if the schema hints are confusing
    if (typeof quizData === 'string') {
      try {
        quizData = JSON.parse(quizData);
      } catch (e) {
        console.error('Failed to parse stringified JSON from Groq:', quizData);
      }
    }

    if (!quizData || !quizData.questions || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
      console.error('Invalid quiz data structure from Groq:', JSON.stringify(quizData));
      return NextResponse.json(
        { error: 'AI returned invalid questions structure', received: quizData },
        { status: 500 }
      );
    }

    // Shuffle questions and options
    const shuffled = quizData.questions
      .sort(() => Math.random() - 0.5)
      .map((q: any) => ({
        ...q,
        options: q.options.sort(() => Math.random() - 0.5),
      }));

    return NextResponse.json({ questions: shuffled });
  } catch (error) {
    console.error('Generate Quiz API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate quiz' },
      { status: 500 }
    );
  }
}
