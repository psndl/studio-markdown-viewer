'use server';
/**
 * @fileOverview A document search AI agent.
 *
 * - searchDocs - A function that handles the document search process.
 * - SearchDocsInput - The input type for the searchDocs function.
 * - SearchDocsOutput - The return type for the searchDocs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';

const SearchDocsInputSchema = z.object({
  query: z.string(),
});
export type SearchDocsInput = z.infer<typeof SearchDocsInputSchema>;

const SearchDocsOutputSchema = z.object({
  match: z.string(),
});
export type SearchDocsOutput = z.infer<typeof SearchDocsOutputSchema>;


export async function searchDocs(input: SearchDocsInput): Promise<SearchDocsOutput> {
  return searchDocsFlow(input);
}

const searchDocsFlow = ai.defineFlow(
  {
    name: 'searchDocsFlow',
    inputSchema: SearchDocsInputSchema,
    outputSchema: SearchDocsOutputSchema,
  },
  async ({query}) => {
    const docsDir = path.join(process.cwd(), 'docs');
    const files = await fs.readdir(docsDir);

    const documents = await Promise.all(
      files
        .filter(file => file.endsWith('.md'))
        .map(async file => {
          const content = await fs.readFile(path.join(docsDir, file), 'utf-8');
          return {filename: file, content};
        })
    );

    const llmResponse = await ai.generate({
      prompt: `You are a document search expert. A user is searching for: "${query}".
      
      Here are the available documents:
      ${documents.map(doc => `--- DOCUMENT: ${doc.filename} ---\n${doc.content}`).join('\n\n')}
      
      Review the user's query and the content of all documents.
      Which single document is the most relevant to the user's query?
      Respond with ONLY the filename of the most relevant document (e.g., "getting-started.md").
      If NO document is relevant, respond with an empty string.`,
      config: {
        temperature: 0,
      },
    });

    const match = (llmResponse.text ?? '').trim();
    
    if (files.includes(match)) {
        return { match };
    }

    return { match: '' };
  }
);
