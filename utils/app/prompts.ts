import {Snippet} from '@/types/snippet';

export const saveSnippets = (snippets: Snippet[]) => {
  localStorage.setItem('snippets', JSON.stringify(snippets));
};
