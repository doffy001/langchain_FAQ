import { ChatOpenAI } from '@langchain/openai';
import { Calculator } from '@langchain/community/tools/calculator';
import { SerpAPI } from '@langchain/community/tools/serpapi';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import type { ChatPromptTemplate } from '@langchain/core/prompts';
import { pull } from 'langchain/hub';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
require('dotenv').config();

export const run = async () => {
  const llm = new ChatOpenAI({ temperature: 0 });
  const tools = [new SerpAPI(), new Calculator()];
  const prompt = await pull<ChatPromptTemplate>(
    'hwchase17/openai-functions-agent'
  );
  const agent = await createOpenAIFunctionsAgent({
    llm,
    tools,
    prompt,
  });
  const agentExecutor = new AgentExecutor({
    agent,
    tools,
  });
  const chatMessageHistory = new ChatMessageHistory();
  const agentWithChatHistory = new RunnableWithMessageHistory({
    runnable: agentExecutor,
    getMessageHistory: (_sessionId) => chatMessageHistory,
    inputMessagesKey: 'input',
    historyMessagesKey: 'chat_history',
  });

  const setting = {
    configurable: {
      sessionId: 'foo',
    },
  };

  const input1 = 'こんにちは!';
  const response1 = await agentWithChatHistory.invoke(
    { input: input1 },
    { ...setting }
  );
  console.log('Human:', input1);
  console.log('AI:', response1['output']);
  console.log('---');

  const input2 = 'AIさんの好きな料理は？';
  const response2 = await agentWithChatHistory.invoke(
    { input: input2 },
    { ...setting }
  );
  console.log('Human:', input2);
  console.log('AI:', response2['output']);
  console.log('---');

  const input3 = 'その料理の作り方は？';
  const response3 = await agentWithChatHistory.invoke(
    { input: input3 },
    { ...setting }
  );
  console.log('Human:', input3);
  console.log('AI:', response3['output']);
  console.log('---');
};

run();
