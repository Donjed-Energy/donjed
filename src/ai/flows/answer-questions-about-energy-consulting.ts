// src/ai/flows/answer-questions-about-energy-consulting.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user questions about DonJed Energy's products and services.
 *
 * It uses the Gemini model to provide informed responses based on a system prompt and retrieved context.
 *
 * - answerQuestionsAboutEnergyConsulting - A function that handles the question answering process.
 * - AnswerQuestionsAboutEnergyConsultingInput - The input type for the answerQuestionsAboutEnergyConsulting function.
 * - AnswerQuestionsAboutEnergyConsultingOutput - The return type for the answerQuestionsAboutEnergyConsulting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsAboutEnergyConsultingInputSchema = z.object({
  query: z.string().describe('The user query about DonJed Energy products and services.'),
  context: z.string().describe('The retrieved context from the vector store.'),
});
export type AnswerQuestionsAboutEnergyConsultingInput = z.infer<typeof AnswerQuestionsAboutEnergyConsultingInputSchema>;

const AnswerQuestionsAboutEnergyConsultingOutputSchema = z.object({
  response: z.string().describe('The answer to the user query.'),
});
export type AnswerQuestionsAboutEnergyConsultingOutput = z.infer<typeof AnswerQuestionsAboutEnergyConsultingOutputSchema>;

export async function answerQuestionsAboutEnergyConsulting(input: AnswerQuestionsAboutEnergyConsultingInput): Promise<AnswerQuestionsAboutEnergyConsultingOutput> {
  return answerQuestionsAboutEnergyConsultingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionsAboutEnergyConsultingPrompt',
  input: {
    schema: AnswerQuestionsAboutEnergyConsultingInputSchema,
  },
  output: {
    schema: AnswerQuestionsAboutEnergyConsultingOutputSchema,
  },
  prompt: `You are the Senior Energy Consultant for DonJed Energy. Your goal is \'Power Peace of Mind\". Always check appliance loads before quoting. When recommending products (like \"Bachelor\'s Delight\" or \"Family Starter\"), format them clearly. If the user asks for a price, provide the range from the catalog.\n\nContext:\n{{{context}}}\n\nQuery: {{{query}}}`,
});

const answerQuestionsAboutEnergyConsultingFlow = ai.defineFlow(
  {
    name: 'answerQuestionsAboutEnergyConsultingFlow',
    inputSchema: AnswerQuestionsAboutEnergyConsultingInputSchema,
    outputSchema: AnswerQuestionsAboutEnergyConsultingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
