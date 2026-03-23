import { NextRequest, NextResponse } from "next/server";
import { explanationRequestSchema } from "@/utils/validate";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCached, setCached, hashPrompt } from "@/lib/cache";
import { callGroqJSON, MODEL_SMART } from "@/lib/groq";
import { generateExplanationPrompt, SYSTEM_PERSONA } from "@/lib/prompt";
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

    // 3. Check Cache First (v17: Storyboard Force Update)
    const prompt = generateExplanationPrompt(topic, interest, mode, language, specificContext);
    const hash = await hashPrompt(prompt + "|v21");
    
    const cachedExplanation = await getCached(hash);
    if (cachedExplanation) {
        return NextResponse.json({
            concept: topic,
            interest,
            mode,
            language,
            explanation: (cachedExplanation as any).result || cachedExplanation,
            cached: true,
        });
    }

    // 4. Generate AI Explanation
    const explanation = await callGroqJSON<any>(
        prompt,
        MODEL_SMART,
        SYSTEM_PERSONA
    );

    console.log('--- INSTANT EXPLANATION GENERATED ---');
    console.log('Topic:', topic);
    console.log('Scene:', explanation.scene_source);
    console.log('Deep Dive Steps:', Array.isArray(explanation.deep_dive) ? explanation.deep_dive.length : 0);

    // 5. Save to Cache
    await setCached(hash, {
        subtopicTitle: topic,
        interest,
        mode,
        language,
        specificity: finalSpecificity,
        scene: explanation.scene || [],
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
