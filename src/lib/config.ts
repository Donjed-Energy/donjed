import { z } from 'zod';

const envSchema = z.object({
  GOOGLE_API_KEY: z.string().min(1, 'GOOGLE_API_KEY is required'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  MONGODB_DB_NAME: z.string().min(1, 'MONGODB_DB_NAME is required'),
  MONGODB_COLLECTION_NAME: z.string().min(1, 'MONGODB_COLLECTION_NAME is required'),
  MONGODB_INDEX_NAME: z.string().min(1, 'MONGODB_INDEX_NAME is required'),
});

// Using `process.env` directly for server-side code.
export const serverConfig = {
  googleApiKey: process.env.GOOGLE_API_KEY!,
  mongodbUri: process.env.MONGODB_URI!,
  mongodbDbName: process.env.MONGODB_DB_NAME!,
  mongodbCollectionName: process.env.MONGODB_COLLECTION_NAME!,
  mongodbIndexName: process.env.MONGODB_INDEX_NAME!,
};

const parsedEnv = envSchema.safeParse({
  GOOGLE_API_KEY: serverConfig.googleApiKey,
  MONGODB_URI: serverConfig.mongodbUri,
  MONGODB_DB_NAME: serverConfig.mongodbDbName,
  MONGODB_COLLECTION_NAME: serverConfig.mongodbCollectionName,
  MONGODB_INDEX_NAME: serverConfig.mongodbIndexName,
});

if (typeof window === 'undefined' && !parsedEnv.success) { // only run on server
  console.error(
    '❌ Invalid environment variables:',
    parsedEnv.error.flatten().fieldErrors,
  );
  throw new Error('Invalid environment variables. Check your .env.local file.');
}

export const env = parsedEnv.success ? parsedEnv.data : ({} as z.infer<typeof envSchema>);
