import { Snippet } from '@/types/snippet';

export interface PromptbarInitialState {
  searchTerm: string;
  filteredPrompts: Snippet[];
}

export const initialState: PromptbarInitialState = {
  searchTerm: '',
  filteredPrompts: [],
};
