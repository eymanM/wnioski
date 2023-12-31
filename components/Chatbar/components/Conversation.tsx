import {IconCheck, IconMessage, IconSettings2,} from '@tabler/icons-react';
import {useContext, useState,} from 'react';

import {Conversation} from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';
import {ThreadModal} from "@/components/Promptbar/components/ThreadModal";
import {getProjects, handleUpdateConversationInProject} from "@/utils/app/projects";

interface Props {
  conversation: Conversation;
  projectId: string;
}

export const ConversationComponent = ({conversation, projectId}: Props) => {

  const {
    state: {selectedConversation, messageIsStreaming},
    handleSelectConversation,
    handleDeleteConversation,
    dispatch: homeDispatch,
  } = useContext(HomeContext);


  const [showThreadModal, setThreadShowModal] = useState(false);
  const handleUpdate = async (conversation: Conversation) => {
    await handleUpdateConversationInProject(projectId, conversation)
    const projs = await getProjects();

    homeDispatch({field: 'projects', value: projs});
  }

  return (
    <div className="relative flex items-center">
      {(
        <div
          className={`flex w-full cursor-pointer items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200 hover:bg-[#343541]/90 ${
            messageIsStreaming ? 'disabled:cursor-not-allowed' : ''
          } ${
            selectedConversation?.id === conversation.id
              ? 'bg-[#343541]/90'
              : ''
          }`}
          onClick={() => {
            handleSelectConversation(conversation);
          }}
        >
          {!conversation.outcome ? <IconMessage size={18}/> : <IconCheck size={18} className={'bg-green-900'}/>}
          <div
            className={`relative max-h-6 flex-1 overflow-hidden text-ellipsis whitespace-nowrap break-all text-left text-[12.5px] `
            }
          >
            <div
              className='flex justify-between rounded cursor-pointer'
            >
              <div className='flex gap-2 cursor-default'>
                <div className='flex items-center'>{conversation.name}</div>
              </div>
              <button
                onClick={async () => {
                  setThreadShowModal(true);
                }}
                className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10 hover:bg-gray-500/20 transition-colors duration-200'
                title={'Settings'!}
              >
                <IconSettings2 size={16}/>
              </button>

            </div>
          </div>
        </div>
      )}
      {showThreadModal && (
        <ThreadModal
          conversation={conversation}
          projectId={projectId}
          onClose={() => setThreadShowModal(false)}
          onUpdate={handleUpdate}
          onDelete={handleDeleteConversation}
        />
      )}
    </div>
  );
};
