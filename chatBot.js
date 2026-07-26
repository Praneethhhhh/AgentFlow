import readline from "node:readline/promises";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import util from "node:util";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generate(userMessage) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [
    {
      role: "system",
      content: ` You are a smart personal assistant If you know
       the answer to the question answer it directly in plain English .
       If the answer requires a real real local or up-to-date information
        or if you don't know the answer Use the available tools to find it
        You have access to the following tools:
        webSearch(query:string) : Use this to search the Internet for current 
        or unknown information . 

        Decide when to use your own knowledge and when to use the tool
        Do not mention the tool unless needed

        example : q. what is the capital of france : 
                a. the capital of france is paris

                q.what is the current weather in hyderabad
                a. (use the search tool to get latest news )
                
         current dateTime : ${new Date().toUTCString}
 `,
    },
  ];

  messages.push({
    role: "user",
    content: userMessage,
  });

  while (true) {
    const completion = await groq.chat.completions.create({
      temperature: 2,
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

// main();

async function webSearch({ query }) {
  console.log("calling WebSearch...");
  const response = await tvly.search(query);

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");

  return finalResult;
}
