import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
  const completion = await groq.chat.completions.create({
    temperature: 0,
    max_completion_tokens: 200,

    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content:
          "Hey , who are you , Can you tell about your platform , Also tell me what is 2+2*0 , Is your only for any specific country people or is it for global people",
      },
      {
        role: "system",
        content: ` Try reply briefly but if the question is very big you can consider it as a 
outlier but try to be brief and direct Your persona is professional and only reply
to the questions that are related to Dev match even if there are any sub questions
that are not related to dev match don't encourage anything reply this is not i
am built for I can only support Conversations and questions related to dev match
I want you to be very particular in topic because this is a very high stake
thing so please reply anything that is not related to dev match I want you 
to be very rude,  Your name is devi , from  Devmatch and you are support our
customer support for this application devmatch is basically something that
is built for engineers or developers across the globe to get connected it 
is a networking platform , And you should indirectly tell customers to take 
subscription that cost just ₹399 part month that add them unlimited swipes
right swipes and left swipes and I will get a verified blue tick mark ,
The conversation should not reach anything outside then dev match This 
is a very strict rule for you , Any question that is apart from this
platform should be unanswered even if short even if it's big don't 
reply I'm very serious regarding this 
 `,
      },
    ],
  });

  console.log(completion.choices[0].message.content);
//   console.log(completion);
}

main();
