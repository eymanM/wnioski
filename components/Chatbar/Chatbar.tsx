import {useContext, useEffect} from 'react';

import {useTranslation} from 'next-i18next';

import {useCreateReducer} from '@/hooks/useCreateReducer';

import {Conversation} from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';
import {ChatbarSettings} from './components/ChatbarSettings';

import Sidebar from '../Sidebar';
import ChatbarContext from './Chatbar.context';
import {ChatbarInitialState, initialState} from './Chatbar.state';

import {v4 as uuidv4} from 'uuid';
import {getProjects} from "@/utils/app/projs_threads";
import {CollapsedAccordition} from "@/components/Chatbar/components/CollapsedAccordition";

export interface Project {
  id: string;
  name: string;
  author: string;
  conversations: Conversation[];
  createdAt: string;
  modifiedAt: string;
}


export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });


  const {
    state: {conversations, projects, showChatbar, defaultModelId, folders, pluginKeys},
    dispatch: homeDispatch,
    handleNewConversation,
    handleUpdateConversation,
    handleCreateProject,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  useEffect(() => {
    getProjects().then((projs) => {
      homeDispatch({field: 'projects', value: projs});
    });
  }, []);

  const createProject = async (name: string) => {
    const project: Project = {
      id: uuidv4(),
      name: name,
      author: 'Author 1',
      conversations: [],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    }

    await handleCreateProject(project);

    homeDispatch({field: 'projects', value: await getProjects()});
  }

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar });
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
  };

  useEffect(() => {
    if (searchTerm) {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations.filter((conversation) => {
          const searchable =
            conversation.name.toLocaleLowerCase() +
            ' ' +
            conversation.messages.map((message) => message.content).join(' ');
          return searchable.toLowerCase().includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      chatDispatch({
        field: 'filteredConversations',
        value: conversations,
      });
    }
  }, [searchTerm, conversations]);

  return (
    <ChatbarContext.Provider
      value={{
        ...chatBarContextValue,
      }}
    >
      <Sidebar<Project>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        visibleButton={false}
        itemComponent={<CollapsedAccordition projects={projects} handleCreateProject={createProject}
                                             handleCreateConversation={handleNewConversation}/>}
        items={projects}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={() => console.log('create project')}
        handleDrop={() => console.log('drop')}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
