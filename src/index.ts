import { OpenAI } from "@langchain/openai";
require('dotenv').config();

export const run = async () => {
  const question = 'What would be a good company name a company that makes colorful socks?';
  const model = new OpenAI({ temperature: 0.9 });
  const result = await model.invoke(question);
  console.log('🚀 ~ res:', result);
};

run();
