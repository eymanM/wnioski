import {IconTextCaption,} from '@tabler/icons-react';
import {useContext, useState,} from 'react';

import {Snippet} from '@/types/snippet';

import PromptbarContext from '../PromptBar.context';
import {PromptModal} from './PromptModal';

interface Props {
  prompt: Snippet;
}

export const PromptComponent = ({prompt}: Props) => {
  const {
    handleUpdatePrompt,
    handleDeletePrompt

  } = useContext(PromptbarContext);

  const [showModal, setShowModal] = useState<boolean>(false);

  const handleUpdateSnippet = (snippet: Snippet) => {
    handleUpdatePrompt(snippet);
  };

  const handleDeleteSnippet = async (snippetId: string) => {
    handleDeletePrompt(snippetId);
  };

  return (
    <div className="relative flex items-center">
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90"
        draggable="true"
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      >
        <IconTextCaption size={18}/>

        <div
          className="relative max-h-5 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all pr-4 text-left text-[12.5px] leading-3">
          {prompt.name}
        </div>
      </button>

      {showModal && (
        <PromptModal
          prompt={prompt}
          onClose={() => setShowModal(false)}
          onUpdateSnippet={handleUpdateSnippet}
          onDeleteSnippet={handleDeleteSnippet}
        />
      )}
    </div>
  );
};
