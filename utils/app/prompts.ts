import { Snippet } from '@/types/snippet';

export const updatePrompt = (updatedPrompt: Snippet, allPrompts: Snippet[]) => {
  const updatedPrompts = allPrompts.map((c) => {
    if (c.id === updatedPrompt.id) {
      return updatedPrompt;
    }

    return c;
  });

  savePrompts(updatedPrompts);

  return {
    single: updatedPrompt,
    all: updatedPrompts,
  };
};

export const savePrompts = (prompts: Snippet[]) => {
  localStorage.setItem('prompts', JSON.stringify(prompts));
};
