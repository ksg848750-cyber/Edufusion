import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { mentorChatSchema } from '@/utils/validate';
import { generateMentorPrompt } from '@/lib/prompt';
import { callGroq, MODEL_SMART } from '@/lib/groq';
import { adminDb } from '@/lib/firebase-admin';
import type { UserProfile } from '@/types/user';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = mentorChatSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { message, courseId, topicId, subtopicId, activeInterest } = result.data;

    // Get user profile
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? (userDoc.data() as UserProfile) : null;

    // Get topic and subtopic titles
    const topicDoc = await adminDb.collection('topics').doc(topicId).get();
    const subtopicDoc = await adminDb.collection('subtopics').doc(subtopicId).get();
    const courseDoc = await adminDb.collection('courses').doc(courseId).get();

    const topicTitle = topicDoc.exists ? topicDoc.data()?.title || 'Topic' : 'Topic';
    const subtopicTitle = subtopicDoc.exists ? subtopicDoc.data()?.title || 'Subtopic' : 'Subtopic';
    const courseTitle = courseDoc.exists ? courseDoc.data()?.title || 'Course' : 'Course';

    // Fetch or create mentor chat
    const chatRef = adminDb.collection('mentorChats');
    const chatQuery = await chatRef
      .where('userId', '==', user.uid)
      .where('courseId', '==', courseId)
      .where('topicId', '==', topicId)
      .limit(1)
      .get();

    let chatDocRef: FirebaseFirestore.DocumentReference;
    let chatData: Record<string, unknown>;

    if (chatQuery.empty) {
      chatDocRef = chatRef.doc();
      chatData = {
        chatId: chatDocRef.id,
        userId: user.uid,
        courseId,
        topicId,
        subtopicId,
        messages: [],
        chatSummary: '',
        activeInterest,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await chatDocRef.set(chatData);
    } else {
      chatDocRef = chatQuery.docs[0].ref;
      chatData = chatQuery.docs[0].data();
    }

    const messages = (chatData.messages || []) as { role: string; content: string; timestamp: Date }[];
    const last8 = messages.slice(-8);

    // Build prompt
    const prompt = generateMentorPrompt({
      message,
      courseTitle,
      topicTitle,
      subtopicTitle,
      activeInterest,
      language: userData?.language || 'english',
      last8Messages: last8.map((m) => ({ role: m.role, content: m.content })),
      chatSummary: (chatData.chatSummary as string) || '',
      userProgress: `Level ${userData?.level || 1}, ${userData?.xp || 0} XP`,
    });

    const response = await callGroq(prompt, MODEL_SMART);

    // Append messages
    messages.push(
      { role: 'user', content: message, timestamp: new Date() },
      { role: 'assistant', content: response, timestamp: new Date() }
    );

    const updateData: Record<string, unknown> = {
      messages,
      activeInterest,
      updatedAt: new Date(),
    };

    // Compress chat if > 10 messages
    if (messages.length > 10) {
      try {
        const summaryPrompt = `Summarize this conversation in 2-3 sentences, capturing the key topics discussed and any important conclusions:\n${messages.map((m) => `${m.role}: ${m.content}`).join('\n')}`;
        const summary = await callGroq(summaryPrompt, 'llama3-8b-8192');
        updateData.chatSummary = summary;
      } catch {
        // Non-critical
      }
    }

    await chatDocRef.update(updateData);

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Mentor Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to get mentor response' },
      { status: 500 }
    );
  }
}
