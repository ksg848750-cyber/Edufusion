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

    const { message, courseId, topicId, subtopicId, subtopicTitle: passedTitle, activeInterest } = result.data;

    // Get user profile
    const userDoc = await adminDb.collection('users').doc(user.uid).get();
    const userData = userDoc.exists ? (userDoc.data() as UserProfile) : null;

    // Get topic and subtopic titles (optional for Quick Explain)
    let topicTitle = 'Topic';
    let subtopicTitle = passedTitle || 'Subtopic';
    let courseTitle = 'Course';

    if (courseId && topicId && subtopicId) {
      const [topicDoc, subtopicDoc, courseDoc] = await Promise.all([
        adminDb.collection('topics').doc(topicId).get(),
        adminDb.collection('subtopics').doc(subtopicId).get(),
        adminDb.collection('courses').doc(courseId).get(),
      ]);
      topicTitle = topicDoc.data()?.title || topicTitle;
      subtopicTitle = subtopicDoc.data()?.title || subtopicTitle;
      courseTitle = courseDoc.data()?.title || courseTitle;
    }

    // Fetch or create mentor chat
    const chatRef = adminDb.collection('mentorChats');
    let chatQuery;
    
    if (courseId && topicId) {
      chatQuery = await chatRef
        .where('userId', '==', user.uid)
        .where('courseId', '==', courseId)
        .where('topicId', '==', topicId)
        .limit(1)
        .get();
    } else {
      // Quick Explain Mode
      chatQuery = await chatRef
        .where('userId', '==', user.uid)
        .where('type', '==', 'quick')
        .where('concept', '==', subtopicTitle)
        .limit(1)
        .get();
    }

    let chatDocRef: FirebaseFirestore.DocumentReference;
    let chatData: Record<string, unknown>;

    if (chatQuery.empty) {
      chatDocRef = chatRef.doc();
      chatData = {
        chatId: chatDocRef.id,
        userId: user.uid,
        type: courseId ? 'course' : 'quick',
        concept: subtopicTitle,
        courseId: courseId || null,
        topicId: topicId || null,
        subtopicId: subtopicId || null,
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
