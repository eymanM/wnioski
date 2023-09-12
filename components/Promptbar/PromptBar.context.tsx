import { Dispatch, createContext } from 'react';

import { ActionType } from '@/hooks/useCreateReducer';

import { Snippet } from '@/types/snippet';

import { PromptbarInitialState } from './Promptbar.state';

export interface PromptbarContextProps {
  state: PromptbarInitialState;
  dispatch: Dispatch<ActionType<PromptbarInitialState>>;
  handleCreatePrompt: () => void;
  handleDeletePrompt: (prompt: Snippet) => void;
  handleUpdatePrompt: (prompt: Snippet) => void;
}

const PromptbarContext = createContext<PromptbarContextProps>(undefined!);

export default PromptbarContext;
