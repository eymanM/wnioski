import {createContext, Dispatch} from 'react';

import {ActionType} from '@/hooks/useCreateReducer';

import {Conversation} from '@/types/chat';
import {KeyValuePair} from '@/types/data';
import {FolderType} from '@/types/folder';

import {HomeInitialState} from './home.state';
import {Project, Thread} from "@/components/Chatbar/Chatbar";

export interface HomeContextProps {
  state: HomeInitialState;
  dispatch: Dispatch<ActionType<HomeInitialState>>;
  handleNewConversation: (projectId: string, threadId: string) => Promise<void>;
  handleSelectConversation: (conversation: Conversation) => void;
  handleUpdateConversation: (projectId: string, threadId: string,
    conversation: Conversation,
    data: KeyValuePair,
  ) => void;
  handleCreateProject: (project: Project) => void;
  handleDeleteProject: (projectId: string) => void;
  handleUpdateProject: (project: Project) => void;
  handleCreateThreadInProject: (projectId: string, thread: Thread) => void;
  handleDeleteThreadInProject: (projectId: string, threadId: string) => void;
  handleUpdateThreadInProject: (projectId: string, thread: Thread) => void;
}

const HomeContext = createContext<HomeContextProps>(undefined!);

export default HomeContext;
