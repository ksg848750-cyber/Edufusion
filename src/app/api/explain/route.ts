import { NextRequest, NextResponse } from "next/server";
import { explanationRequestSchema } from "@/utils/validate";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCached, setCached, hashPrompt } from "@/lib/cache";
import { callGroqJSON } from "@/lib/groq";
import { generateExplanationPrompt } from "@/lib/prompt";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
try {
// 1. Verify Authentication
const user = await getAuthenticatedUser(req);
if (!user || (!user.uid)) {
return NextResponse.json(
{ error: "Unauthorized" },
{ status: 401 }
);
}
    // 2. Parse and Validate Request Body
    const body = await req.json();
    const validatedData = explanationRequestSchema.parse(body);
    const { topic, interest, mode, language, specificContext } = validatedData;
    const finalSpecificity = specificContext || "";

    // 3. Check Cache First
    const prompt = generateExplanationPrompt(topic, interest, mode, language, specificContext);
    const hash = await hashPrompt(prompt);
    
    const cachedExplanation = await getCached(hash);
    if (cachedExplanation) {
        return NextResponse.json({
            concept: topic,
            interest,
            mode,
            language,
            explanation: cachedExplanation,
            cached: true,
        });
    }

    // 4. Generate AI Explanation
    const explanation = await callGroqJSON<any>(prompt);

    // 5. Save to Cache
    await setCached(hash, {
        subtopicTitle: topic,
        interest,
        mode,
        language,
        specificity: finalSpecificity,
        scene: explanation.scene || "",
        sceneSource: explanation.scene_source || "",
        result: explanation,
    });

    // 6. Return Response
    return NextResponse.json({
        concept: topic,
        interest,
        mode,
        language,
        explanation,
        cached: false,
    });

} catch (error) {
    console.error("Explanation API Error:", error);

    if (error instanceof ZodError) {
        return NextResponse.json(
            { error: "Validation failed", details: (error as any).errors },
            { status: 400 }
        );
    }

    return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
    );
}
}
