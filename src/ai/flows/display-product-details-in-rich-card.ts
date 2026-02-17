// This is a server-side code.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for displaying product details in a rich card format.
 *
 * The flow takes a product description as input and returns a formatted rich card
 * containing the product name, price range, and key features.
 *
 * @exports {function} displayProductDetailsInRichCard - The main function to trigger the flow.
 * @exports {type} DisplayProductDetailsInRichCardInput - The input type for the flow.
 * @exports {type} DisplayProductDetailsInRichCardOutput - The output type for the flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DisplayProductDetailsInRichCardInputSchema = z.object({
  productDescription: z
    .string()
    .describe(
      'A detailed description of the product, including name, price range, and key features.'
    ),
});

export type DisplayProductDetailsInRichCardInput = z.infer<
  typeof DisplayProductDetailsInRichCardInputSchema
>;

const DisplayProductDetailsInRichCardOutputSchema = z.object({
  richCardContent: z
    .string()
    .describe(
      'A formatted string containing the product name, price range, and key features in markdown format.'
    ),
});

export type DisplayProductDetailsInRichCardOutput = z.infer<
  typeof DisplayProductDetailsInRichCardOutputSchema
>;

export async function displayProductDetailsInRichCard(
  input: DisplayProductDetailsInRichCardInput
): Promise<DisplayProductDetailsInRichCardOutput> {
  return displayProductDetailsInRichCardFlow(input);
}

const displayProductDetailsInRichCardPrompt = ai.definePrompt({
  name: 'displayProductDetailsInRichCardPrompt',
  input: {schema: DisplayProductDetailsInRichCardInputSchema},
  output: {schema: DisplayProductDetailsInRichCardOutputSchema},
  prompt: `You are an expert marketing assistant specializing in creating product cards.

  Based on the product description, create a markdown-formatted string to be displayed in a rich card.  The card should include the product name, price range, and key features. Format the price range to include the "₦" symbol.

  Product Description: {{{productDescription}}}

  Here is an example output:

  **Product Name:** Bachelor's Delight

  **Price Range:** ₦500k - ₦900k

  **Features:**
  - Feature 1
  - Feature 2
  - Feature 3`,
});

const displayProductDetailsInRichCardFlow = ai.defineFlow(
  {
    name: 'displayProductDetailsInRichCardFlow',
    inputSchema: DisplayProductDetailsInRichCardInputSchema,
    outputSchema: DisplayProductDetailsInRichCardOutputSchema,
  },
  async input => {
    const {output} = await displayProductDetailsInRichCardPrompt(input);
    return output!;
  }
);
