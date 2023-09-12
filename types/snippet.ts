import { OpenAIModel } from './openai';

export interface Snippet {
  id: string;
  name: string;
  description: string;
  content: string;
}
