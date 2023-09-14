import {createContext, Dispatch} from 'react';

import {ActionType} from '@/hooks/useCreateReducer';

import {Conversation} from '@/types/chat';
import {KeyValuePair} from '@/types/data';

import {HomeInitialState} from './home.state';
import {Project} from "@/components/Chatbar/Chatbar";

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewConversation: (projectId: string) => Promise<void>;
  handleSelectConversation: (conversation: Conversation) => void;
  handleSelectProj: (projectId: string, threadId: string) => void;
  handleCreateProject: (project: Project) => Promise<{ projects: Project[] }>;
  handleDeleteProject: (projectId: string) => Promise<{ projects: Project[] }>;
  handleUpdateProject: (project: Project) => Promise<{ projects: Project[] }>;
  handleUpdateConversation: (projectId: string, conversation: Conversation, data: KeyValuePair) => void;
  handleDeleteConversation: (projectId: string, conversationId: string) => Promise<void>;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
