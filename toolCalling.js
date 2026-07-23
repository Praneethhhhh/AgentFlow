import Groq from "groq-sdk";
import { tavily } from "@tavily/core";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const messages = [
    {
      role: "system",
      content: ` You are a smart personal assistant who answers the
         asked questions from Internet You have access to following tools 
         1.webSearch({query}:{query:string})   `,
    },
    {
      role: "user",
      content:
        " In short tell me about the operations close of Oneplus in India",
    },
  ];

  const completion = await groq.chat.completions.create({
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
                description: "search query to perform search on the internet  ",
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
  //   console.log(completion.choices[0].message.tool_calls);
  const toolCalls = completion.choices[0].message.tool_calls;

  if (!toolCalls) {
    console.log(completion.choices[0].messages.content);
    return;
  }

  for (const tool of toolCalls) {
    // console.log("tool:", tool);
    const functionName = tool.function.name;
    const functionParams = tool.function.arguments;
    // console.log(JSON.parse(functionParams));

    if (functionName === "webSearch") {
      const toolResult = await webSearch(JSON.parse(functionParams));
      //   console.log("tool result : ", toolResult);

      messages.push({
        tool_call_id: tool.id,
        role: "tool",
        name: functionName,
        content: toolResult,
      });
    }
  }

  const completion2 = await groq.chat.completions.create({
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
                description: "search query to perform search on the internet  ",
              },
            },
            required: ["query"],
          },
        },
      },
    ],
    tool_choice: "auto",
  });

  console.log(JSON.stringify(completion2.choices[0].message, null, 2));
  console.log(JSON.stringify(completion2.choices[0].message.content, null, 2));
  //   console.log("messages",messages);
}

main();

async function webSearch({ query }) {
  console.log("calling webSearch");

  const response = await tvly.search(query);
  //   console.log(response)

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");

  //   console.log(finalResult);

  return finalResult;
}
