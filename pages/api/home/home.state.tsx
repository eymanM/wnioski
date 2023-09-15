import {Conversation, Message} from '@/types/chat';
import {ErrorMessage} from '@/types/error';
import {OpenAIModel, OpenAIModelID} from '@/types/openai';
import {Snippet} from '@/types/snippet';
import {Project} from "@/components/Chatbar/Chatbar";

export interface HomeInitialState {
  apiKey: string;
  loading: boolean;
  lightMode: 'light' | 'dark';
  messageIsStreaming: boolean;
  modelError: ErrorMessage | null;
  models: OpenAIModel[];
  conversations: Conversation[];
  selectedProjectId: string | undefined;
  projects: Project[];
  selectedConversation: Conversation | undefined;
  currentMessage: Message | undefined;
  snippets: Snippet[];
  temperature: number;
  showChatbar: boolean;
  showPromptbar: boolean;
  messageError: boolean;
  defaultModelId: OpenAIModelID | undefined;
  serverSideApiKeyIsSet: boolean;
}

export const initialState: HomeInitialState = {
  apiKey: '',
  loading: false,
  lightMode: 'dark',
  messageIsStreaming: false,
  modelError: null,
  models: [],
  conversations: [],
  selectedProjectId: undefined,
  projects: [],
  selectedConversation: undefined,
  currentMessage: undefined,
  snippets: [],
  temperature: 1,
  showPromptbar: true,
  showChatbar: true,
  messageError: false,
  defaultModelId: undefined,
  serverSideApiKeyIsSet: false,
};
