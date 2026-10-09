import readLine from "node:readline/promises";
import Groq from "groq-sdk";
import { vectorStore } from "./prepare.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function chat() {
  const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  while (true) {
    const question = await rl.question("You: ");
    if (question == "/bye") {
      break;
    }

    const relevantChunks = await vectorStore.similaritySearch(question, 4);

    // new change
    const context = relevantChunks
      .map(
        (chunk, index) =>
          `--- DOCUMENT CHUNK ${index + 1} ---\n${chunk.pageContent}`,
      )
      .join("\n\n");

    const SYSTEM_PROMPT = `You are an AI assistant for question answering tasks.

RULES:
1. Answer the question directly using ONLY the facts provided in the <context> block.
2. If the answer is not contained in the context, say "I don't have enough context to answer that question."
3. DO NOT repeat the context, question, or XML tags in your response. Provide ONLY the answer.`;

    const userQuery = `
// <context>
// ${context}
// </context>
${context}

Question: ${question}
Answer:`.trim();

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: userQuery,
        },
      ],
      temperature: 1,
    });

    console.log(`Assistant: ${completion.choices[0].message.content}`);
    // console.log(`here u go :${userQuery}`);
  }

  rl.close();
}

chat();
