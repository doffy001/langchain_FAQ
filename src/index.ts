import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { OpenAIEmbeddings, ChatOpenAI } from '@langchain/openai';
import { pull } from 'langchain/hub';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { formatDocumentsAsString } from "langchain/util/document";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "@langchain/core/runnables";
require('dotenv').config();

const question = 'How many component are there in this post? And tell me summary of them.';

(async () => {
  const loader = new CheerioWebBaseLoader(
    'https://lilianweng.github.io/posts/2023-06-23-agent/'
  );

  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splits = await textSplitter.splitDocuments(docs);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings()
  );

  const retriever = vectorStore.asRetriever();
  const prompt = await pull<ChatPromptTemplate>('rlm/rag-prompt');
  const llm = new ChatOpenAI({ model: 'gpt-4o', temperature: 0 });

  const declarativeRagChain = RunnableSequence.from([
    {
      question: new RunnablePassthrough(),
      context: retriever.pipe(formatDocumentsAsString),
    },
    prompt,
    llm,
    new StringOutputParser(),
  ]);

  const answer = await declarativeRagChain.invoke(question);

  console.log('Question:', question);
  console.log('Answer:', answer);
})();
