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
  handleCreateProject: (project: Project) => void;
  handleDeleteProject: (projectId: string) => void;
  handleUpdateProject: (project: Project) => void;
  handleUpdateConversation: (projectId: string, conversation: Conversation, data: KeyValuePair) => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
