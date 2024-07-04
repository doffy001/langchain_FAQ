import { DallEAPIWrapper } from '@langchain/openai';
require('dotenv').config();

const question = 'an image of forest biology loss';

(async () => {
  const tool = new DallEAPIWrapper({
    model: 'dall-e-2',
    style: 'natural',
    size: '256x256'
  });
  const imageURL = await tool.invoke(question);

  console.log(imageURL);
})();
