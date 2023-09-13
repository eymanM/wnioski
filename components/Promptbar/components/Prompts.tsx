import {FC} from 'react';

import {Snippet} from '@/types/snippet';

import {PromptComponent} from './Prompt';

interface Props {
  prompts: Snippet[];
}

export const Prompts: FC<Props> = ({prompts}) => {
  return (
    <div className="flex w-full flex-col gap-1">
      {prompts
        .slice()
        .reverse()
        .map((prompt, index) => (
          <PromptComponent key={index} prompt={prompt}/>
        ))}
    </div>
  );
};
