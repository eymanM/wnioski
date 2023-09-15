import {MutableRefObject} from 'react';

import {Snippet} from '@/types/snippet';

interface Props {
  prompts: Snippet[];
  activePromptIndex: number;
  onSelect: () => void;
  onMouseOver: (index: number) => void;
  promptListRef: MutableRefObject<HTMLUListElement | null>;
}


