import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const openaiChatResponse = async (
  messages: Array<OpenAI.ChatCompletionMessageParam>
) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: messages,
  });

  return response.choices[0].message?.content;
};
