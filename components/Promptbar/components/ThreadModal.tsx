import {FC, KeyboardEvent, useContext, useEffect, useRef, useState} from 'react';
import {Conversation} from "@/types/chat";
import HomeContext from "@/pages/api/home/home.context";
import {Snippet} from "@/types/snippet";
import {useTranslation} from "next-i18next";

interface Props {
  conversation: Conversation;
  projectId: string;
  onClose: () => void;
  onUpdate: (conversation: Conversation) => void;
  onDelete: (projectId: string, conversationId: string) => Promise<void>;
}

export const ThreadModal: FC<Props> = ({conversation, onClose, onUpdate, onDelete, projectId}) => {
  const {t: tCommon} = useTranslation('common');
  const {t: tSidebar} = useTranslation('sidebar');
  const [name, setName] = useState(conversation.name);
  const [outcome, setOutcome] = useState(conversation.outcome);
  //const [snippets, setSnippets] = useState(conversation.snippets);
  const threadModalRef = useRef<HTMLDivElement>(null);
  const threadNameInputRef = useRef<HTMLInputElement>(null);

  const [selectedSnippets, setSelectedSnippets] = useState<Snippet[]>(conversation.snippets);
  const [selectedOutcomesIds, setSelectedOutcomesIds] = useState<string[]>(conversation.includedOutcomesFromConversationIds);

  const toggleOutcome = (conversation: Conversation) => {
    setSelectedOutcomesIds((prev) => {
      if (prev.find((s) => s == conversation.id)) {
        return prev.filter(s => s !== conversation.id)
      } else {
        return [...prev, conversation.id]
      }
    })
  }

  const toggleSnippet = (snippet: Snippet) => {
    setSelectedSnippets((prev) => {
      if (prev.find((s) => s.id == snippet.id)) {
        return prev.filter(s => s.id !== snippet.id)
      } else {
        return [...prev, snippet]
      }
    })
  }


  const {
    state: {snippets, projects, selectedProjectId},

  } = useContext(HomeContext);

  const handleEnter = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      onUpdate({...conversation, name, outcome});
      onClose();
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (threadModalRef.current && !threadModalRef.current.contains(e.target as Node)) {
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
    threadNameInputRef.current?.focus();
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
            ref={threadModalRef}
            className="dark:border-netural-400 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >
            <div className="text-2xl mb-4 items-center flex justify-center text-black dark:text-neutral-300">
              {conversation.name}
            </div>

            <div className="text-sm font-bold text-black dark:text-neutral-200">
              {tCommon('Name')}
            </div>
            <input
              ref={threadNameInputRef}
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              placeholder='Name of your AI conversation for this thread.'
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {tCommon('Outcome')}
            </div>
            <textarea
              rows={5}
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              style={{resize: 'none'}}
              placeholder={tSidebar('Result (outcome) of your AI conversation for this thread')!}
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />

            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {tSidebar('Outcomes from other threads')}
            </div>

            <div>
              {projects.find(p => p.id == selectedProjectId)?.conversations.filter(c => c.outcome && c.id !== conversation.id).filter(Boolean)?.map((conv) => (
                <div key={conv.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedOutcomesIds?.find(((s) => s === conv.id)) != null}
                    onChange={() => toggleOutcome(conv)}
                    className="cursor-pointer"
                  />

                  <div className="font-normal text-lg">
                    {conv.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm font-bold text-black dark:text-neutral-200">
              {tSidebar('Context informations')}
            </div>

            <div>
              {snippets.map((snippet) => (
                <div key={snippet.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedSnippets.find(((s) => s.id == snippet.id)) != null}
                    onChange={() => toggleSnippet(snippet)}
                    className="cursor-pointer"
                  />

                  <div className="font-normal text-lg">
                    {snippet.name}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={() => {
                const updatedConversation: Conversation = {
                  ...conversation,
                  name,
                  snippets: selectedSnippets,
                  includedOutcomesFromConversationIds: selectedOutcomesIds,
                  outcome
                };

                onUpdate(updatedConversation);
                onClose();
              }}
            >
              {tCommon('Save')}
            </button>

            <button
              type="button"
              className="w-full px-4 py-2 mt-10 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={async () => {
                await onDelete(projectId, conversation.id);
                onClose();
              }}
            >
              {tCommon('Delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
