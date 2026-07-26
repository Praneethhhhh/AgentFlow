import readline from "node:readline/promises";
import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import util from "node:util";

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [
    {
      role: "system",
      content: ` you are built by Praneeth Hosalli , You are a smart personal assistant who answers the
         asked questions from Internet You have access to following tools , Keep the responses concise and interesting
         1.webSearch({query}:{query:string}) 
         current dateTime : ${new Date().toUTCString}  `,
    },
  ];

  while (true) {
    const question = await rl.question("You: ");

    if (question === "bye") {
      console.log("AI assistant : Bye , have a good day");
      rl.close();
      break;
    }

    messages.push({
      role: "user",
      content: question,
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
      //   console.log(completion.choices[0].message.tool_calls);
      const toolCalls = completion.choices[0].message.tool_calls;

      if (!toolCalls) {
        console.log("AI assistant : ", completion.choices[0].message.content);

        //   console.log(
        //     util.inspect(messages, {
        //       depth: null,
        //       colors: true,
        //     }),
        //   ); // to see all the data that got added to the source + api tool calls madde

        break;
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

      //   const completion2 = await groq.chat.completions.create({
      //     model: "openai/gpt-oss-120b",
      //     messages: messages,
      //     temperature: 1,
      //     tools: [
      //       {
      //         type: "function",
      //         function: {
      //           name: "webSearch",
      //           description:
      //             " Search the latest information and real time data on the Internet",
      //           parameters: {
      //             type: "object",
      //             properties: {
      //               query: {
      //                 type: "string",
      //                 description: "search query to perform search on the internet  ",
      //               },
      //             },
      //             required: ["query"],
      //           },
      //         },
      //       },
      //     ],
      //     tool_choice: "auto",
      //   });

      //   console.log(completion2);
      //   console.log(JSON.stringify(completion2.choices[0].message, null, 2));
      // console.log(JSON.stringify(completion2.choices[0].message.content, null, 2));
      //   console.log("messages",messages);
    }
  }
}

main();

async function webSearch({ query }) {
  console.log("calling WebSearch...");

  const response = await tvly.search(query);
  //   console.log(response)

  const finalResult = response.results
    .map((result) => result.content)
    .join("\n\n");

  //   console.log(finalResult);

  return finalResult;
}
