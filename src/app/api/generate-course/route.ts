import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { callGroqJSON } from '@/lib/groq';
import { createCourseStructure } from '@/lib/course';
import type { CourseStructure, CourseSource } from '@/types/course';

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse body — accept both "subject" and "syllabusText"
    const body = await req.json();
    const { subject, syllabusText } = body;

    if (!subject?.trim() && !syllabusText?.trim()) {
      return NextResponse.json(
        { error: 'Either subject or syllabusText is required.' },
        { status: 400 }
      );
    }

    const hasSyllabus = syllabusText && syllabusText.trim() !== '';
    const source: CourseSource = hasSyllabus ? 'syllabus_upload' : 'ai_generated';

    const promptLine = hasSyllabus
      ? `I have the following syllabus text:\n\n"${syllabusText}"\n\nGenerate a structured course based on this syllabus. Follow the exact order of units and topics. Every item must be included.`
      : `Generate a COMPREHENSIVE, deep, and academic course on: "${subject}". 
         Structure it for a student who wants to go from zero to absolute mastery.`;

    const prompt = `${promptLine}

CRITICAL RULES:
1. PERSONA: You are a Senior Curriculum Architect at a top university.
2. GRANULARITY: If a topic has distinct "Types", "Levels", or "Categories" (e.g. Types of OS), DO NOT CLUMP THEM. Each type (Batch, Time-sharing, etc.) MUST be its own subtopic.
3. STRUCTURE: 4-6 units. Each unit: 3-5 topics. Each topic: 3-8 granular subtopics.
4. ORDER: ${hasSyllabus ? 'Exact syllabus order.' : 'Logical progression from fundamentals to advanced.'}
5. INTRO: Unit 1 Topic 1 must be a thorough "Foundations & Definition" section.
6. NO GLOSSING: Do not skip complex sub-concepts. Every technical essential must have a subtopic.

Return ONLY valid JSON matching this schema:
{
  "courseTitle": "string",
  "units": [{
    "unitTitle": "string",
    "topics": [{
      "topicTitle": "string",
      "subtopics": ["subtopic title 1", "subtopic title 2"]
    }]
  }]
}`;

    // 4. Generate via Groq
    const result = await callGroqJSON<{
      courseTitle: string;
      units: {
        unitTitle: string;
        topics: {
          topicTitle: string;
          subtopics: string[] | { title: string }[];
        }[];
      }[];
    }>(
      prompt,
      undefined,
      'You are an expert course generator. Return ONLY valid JSON matching the requested schema. No markdown.'
    );

    // 5. Normalize — handle both string[] and {title}[] subtopic formats
    const structure: CourseStructure = {
      courseTitle: result.courseTitle || subject || 'Untitled Course',
      units: (result.units || []).map((unit) => ({
        unitTitle: unit.unitTitle || 'Untitled Unit',
        topics: (unit.topics || []).map((topic) => ({
          topicTitle: topic.topicTitle || 'Untitled Topic',
          subtopics: (topic.subtopics || []).map((sub) =>
            typeof sub === 'string' ? sub : (sub as { title: string }).title || 'Untitled'
          ),
        })),
      })),
    };

    // 6. Save to Firestore
    const courseId = await createCourseStructure(user.uid, structure, source);

    // 7. Return courseId so dashboard can redirect
    return NextResponse.json({
      courseId,
      title: structure.courseTitle,
      totalUnits: structure.units.length,
    });
  } catch (error: unknown) {
    console.error('Course Generation Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate course' },
      { status: 500 }
    );
  }
}
