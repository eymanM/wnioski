import {FC, KeyboardEvent, useEffect, useRef, useState} from 'react';


import {Snippet} from '@/types/snippet';

interface Props {
  prompt: Snippet;
  onClose: () => void;
  onUpdateSnippet: (snippet: Snippet) => void;
  onDeleteSnippet: (snippetId: string) => Promise<void>;
}

export const PromptModal: FC<Props> = ({prompt, onClose, onUpdateSnippet, onDeleteSnippet}) => {
  const [name, setName] = useState(prompt.name);
  const [description, setDescription] = useState(prompt.description);
  const [content, setContent] = useState(prompt.content);

  const snippetModalRef = useRef<HTMLDivElement>(null);
  const snippetNameInputRef = useRef<HTMLInputElement>(null);

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      onUpdateSnippet({...prompt, name, description, content: content.trim()});
      onClose();
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (snippetModalRef.current && !snippetModalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  useEffect(() => {
    snippetNameInputRef.current?.focus();
  }, []);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onKeyDown={handleEnter}
    >
      <div className="fixed inset-0 z-10 overflow-hidden">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            ref={snippetModalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[700px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-sm font-bold text-black dark:text-neutral-200">
              {'Name'}
            </div>
            <input
              ref={snippetNameInputRef}
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              placeholder={'A name for your prompt.' || ''}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {'Description'}
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              style={{resize: 'none'}}
              placeholder={'Description for this context information'!}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {'Context information'!}
            </div>
            <textarea
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              style={{resize: 'none'}}
              placeholder={'Your snippet..'}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />

            <button
              type="button"
              className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={() => {
                const updatedPrompt = {
                  ...prompt,
                  name,
                  description,
                  content: content.trim(),
                };

                onUpdateSnippet(updatedPrompt);
                onClose();
              }}
            >
              {'Save'}
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 mt-10 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-red-400 dark:text-black dark:hover:bg-red-500"
              onClick={() => {
                onDeleteSnippet(prompt.id);
                onClose();
              }}
            >
              {'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
