/**
 * PDF Processing Script
 * Run this script to extract text from PDFs and create a knowledge base
 * Usage: node scripts/process-pdfs.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pdfParse from "pdf-parse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, "../docs");
const OUTPUT_FILE = path.join(__dirname, "../src/lib/knowledge-base.json");

/**
 * Split text into chunks of approximately maxChunkSize characters
 */
function chunkText(text, maxChunkSize = 1000) {
  const chunks = [];
  const paragraphs = text.split(/\n\n+/);

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (
      (currentChunk + paragraph).length > maxChunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? "\n\n" : "") + paragraph;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Process a single PDF file
 */
async function processPDF(filePath) {
  console.log(`Processing: ${path.basename(filePath)}`);

  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);

    const fileName = path.basename(filePath, ".pdf");
    const chunks = chunkText(data.text);

    console.log(`  - Extracted ${data.numpages} pages`);
    console.log(`  - Created ${chunks.length} chunks`);

    return chunks.map((chunk, index) => ({
      id: `${fileName}_chunk_${index}`,
      text: chunk,
      source: fileName,
      metadata: {
        fileName: fileName,
        totalPages: data.numpages,
        chunkIndex: index,
      },
    }));
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return [];
  }
}

/**
 * Main processing function
 */
async function processAllPDFs() {
  console.log("Starting PDF processing...\n");

  // Get all PDF files
  const files = fs
    .readdirSync(DOCS_DIR)
    .filter((file) => file.endsWith(".pdf"))
    .map((file) => path.join(DOCS_DIR, file));

  if (files.length === 0) {
    console.log("No PDF files found in docs directory");
    return;
  }

  console.log(`Found ${files.length} PDF files\n`);

  // Process all PDFs
  const allChunks = [];

  for (const file of files) {
    const chunks = await processPDF(file);
    allChunks.push(...chunks);
  }

  // Create knowledge base object
  const knowledgeBase = {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    totalDocuments: files.length,
    totalChunks: allChunks.length,
    documents: allChunks,
  };

  // Write to output file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(knowledgeBase, null, 2));

  console.log(`\n✅ Knowledge base created successfully!`);
  console.log(`   Total chunks: ${allChunks.length}`);
  console.log(`   Output: ${OUTPUT_FILE}`);
}

// Run the script
processAllPDFs().catch(console.error);
