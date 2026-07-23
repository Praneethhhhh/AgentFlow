import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const completion = await groq.chat.completions.create({
    temperature: 0,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "Sentiment_Analyszer",
        schema: {
          type: "object",
          properties: {
            sentiment: {
              type: "string",
              enum: ["Positive", "Negative", "Neutral"],
            },
            confidence_score: {
              type: "number",
            },
            summary: {
              type: "string",
            },
          },
          required: ["sentiment", "confidence_score", "summary"],
        },
      },
    },
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "user",
        content:
          " Absolutely amazing! It arrived exaw ctly as expected, and I was pleasantly surprised by hoconsistently it reminded me why reading reviews matters. Every feature worked in its own unique way—just not the way I needed. The customer support gave me plenty of time to practice patience, and the overall experience was unforgettable for reasons I'd rather not repeat. If you're looking for something that lowers your expectations, this product certainly delivers.",
      },
      {
        role: "system",
        content: `You are a data analysis api that performs sentiment analysis on the data
         that user sent.
         `,
      },
    ],
  });

  console.log(JSON.parse(completion.choices[0].message.content));
  //   console.log(completion);
}

main();
