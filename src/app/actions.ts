'use server';

import {run} from '@genkit-ai/next/server';
import {searchDocs} from '@/ai/flows/searchDocs';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const SearchSchema = z.object({
  query: z.string().min(3, "Query must be at least 3 characters long."),
});

export type SearchState = {
  error?: string;
  success?: boolean;
}

export async function search(prevState: SearchState, formData: FormData): Promise<SearchState> {
  const validatedFields = SearchSchema.safeParse({
    query: formData.get('query'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.query?.join(', '),
    };
  }
  
  const query = validatedFields.data.query;

  try {
    const {match} = await run(searchDocs, {query});

    if (match) {
      redirect(`/?file=${match}`);
    } else {
      return { error: 'No relevant document found.' };
    }
  } catch (e) {
    console.error(e);
    return { error: 'An unexpected error occurred during search.' };
  }
}
