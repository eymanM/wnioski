import {Snippet} from '@/types/snippet';

export const savePrompts = (prompts: Snippet[]) => {
  localStorage.setItem('prompts', JSON.stringify(prompts));
};
