import { OpenAIModel } from './openai';
import {Snippet} from "@/types/snippet";

export interface Message {
  role: Role;
  content: string;
}

export type Role = 'assistant' | 'user';

export interface ChatBody {
  messages: Message[];
  key: string;
  prompt: string;
}

export interface Conversation {
  id: string;
  name: string;
  messages: Message[];
  includedOutcomesFromConversationIds: string[];
  prompt: string;
  outcome?: string;
  createdAt: string;
  modifiedAt: string;
  context: string;
  snippets: Snippet[];
}
