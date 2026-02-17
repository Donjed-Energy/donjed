// src/app/api/chat/route.ts
import { answerQuestionsAboutEnergyConsulting } from '@/ai/flows/answer-questions-about-energy-consulting';
import { getEmbedding, performVectorSearch } from '@/lib/mongodb';
import { z } from 'zod';
import {NextRequest, NextResponse} from 'next/server';

export const runtime = 'nodejs';

const ChatRequestSchema = z.object({
  message: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedRequest = ChatRequestSchema.safeParse(body);

    if (!parsedRequest.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { message } = parsedRequest.data;

    // 1. Embed user query
    const embedding = await getEmbedding(message);

    // 2. Perform Vector Search
    const context = await performVectorSearch(embedding);

    // 3. Call Genkit flow with context
    const aiResponse = await answerQuestionsAboutEnergyConsulting({
      query: message,
      context: context,
    });

    const responseText = aiResponse.response;

    // 4. Stream response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        for (const char of responseText) {
          controller.enqueue(encoder.encode(char));
          await new Promise(resolve => setTimeout(resolve, 5)); // Simulate typing
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('🔥 API Error:', error);
    let errorMessage = 'An unexpected error occurred.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: 'Sorry, the AI is taking a nap. Please try again later.', details: errorMessage }, { status: 500 });
  }
}
