// src/lib/mongodb.ts
import { serverConfig } from '@/lib/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Collection, MongoClient } from 'mongodb';

let client: MongoClient | null = null;
let dbName = serverConfig.mongodbDbName;

async function getClient(): Promise<MongoClient> {
  if (client && client.topology && client.topology.isConnected()) {
    return client;
  }
  client = new MongoClient(serverConfig.mongodbUri);
  await client.connect();
  return client;
}

async function getCollection(): Promise<Collection<any>> {
  const mongoClient = await getClient();
  const db = mongoClient.db(dbName);
  return db.collection(serverConfig.mongodbCollectionName);
}

export async function performVectorSearch(embedding: number[]): Promise<string> {
  const collection = await getCollection();
  
  const pipeline = [
    {
      '$vectorSearch': {
        'index': serverConfig.mongodbIndexName,
        'path': 'embedding',
        'queryVector': embedding,
        'numCandidates': 150,
        'limit': 5
      }
    },
    {
      '$project': {
        'embedding': 0,
        '_id': 0,
        'score': {
          '$meta': 'vectorSearchScore'
        }
      }
    }
  ];

  const results = await collection.aggregate(pipeline).toArray();

  if (results.length === 0) {
    return "No relevant information found.";
  }

  // Combine the text from the results to form the context
  const context = results.map(doc => doc.text).join('\n\n---\n\n');
  
  return context;
}

const genAI = new GoogleGenerativeAI(serverConfig.googleApiKey);
const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function getEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (e) {
    console.error("Error getting embedding", e);
    return [];
  }
}
