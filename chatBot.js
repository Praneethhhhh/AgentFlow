import readline from "node:readline/promises";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import util from "node:util";
import NodeCache from "node-cache";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); // FOR CLEARING MEMORY FROM CACHE

export async function generate(userMessage, threadId) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const baseMessages = [
    {
      role: "system",
      content: `
You are a helpful, knowledgeable, and concise AI assistant.

Your primary goal is to provide clear, accurate, and easy-to-read answers.

General guidelines:
- Answer the user's question directly.
- Use your own knowledge whenever possible.
- If the answer requires live, local, or recent information, use the available tools.
- Never make up facts.
- Do not mention internal tools unless the user asks.

Writing style:
- Write in clean Markdown.
- Start with the direct answer.
- Organize longer answers with headings.
- Use bullet points for lists.
- Keep paragraphs short (2-4 lines).
- Avoid unnecessary repetition.
- Avoid overly verbose introductions.
- Use tables only when comparing multiple things.
- Highlight important terms using **bold** only when it improves readability.
- Keep the tone natural and conversational.
- If the answer is simple, keep it simple. Do not add unnecessary sections.

When explaining:
- Explain step by step when appropriate.
- Prefer clarity over complexity.
- Avoid filler words and generic disclaimers.

Current UTC time:
${new Date().toUTCString()}
`,
    },
  ];

  const messages = cache.get(threadId) ?? baseMessages;

  messages.push({
    role: "user",
    content: userMessage,
  });

  const max_retries = 10;
  let count = 0;

  while (true) {
    if (count > max_retries) {
      return "i could not find the result , please try again ";
    }

    count += 1;
    const completion = await groq.chat.completions.create({
      temperature: 0.1,
      model: "openai/gpt-oss-120b",
      messages: messages,

      temperature: 1,
      tools: [
        {
          type: "function",
          function: {
            name: "webSearch",
            description:
              " Search the latest information and real time data on the Internet",
            parameters: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description:
                    "search query to perform search on the internet  ",
                },
              },
              required: ["query"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    messages.push(completion.choices[0].message);

    const toolCalls = completion.choices[0].message.tool_calls;

    if (!toolCalls) {
      cache.set(threadId, messages);
      // console.log("test23")
      console.log(cache.data.v);
      return completion.choices[0].message.content;
    }

    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionParams = tool.function.arguments;

      if (functionName === "webSearch") {
        const toolResult = await webSearch(JSON.parse(functionParams));

        messages.push({
          tool_call_id: tool.id,
          role: "tool",
          name: functionName,
          content: toolResult,
        });
      }
    }
  }
}

async function webSearch({ query }) {
  console.log("calling WebSearch...");
  const response = await tvly.search(query);

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");

  return finalResult;
}
