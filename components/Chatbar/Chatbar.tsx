import {useCallback, useContext, useEffect} from 'react';

import {useTranslation} from 'next-i18next';

import {useCreateReducer} from '@/hooks/useCreateReducer';

import {DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE} from '@/utils/app/const';
import {saveConversation, saveConversations} from '@/utils/app/conversation';
import {saveFolders} from '@/utils/app/folders';
import {exportData, importData} from '@/utils/app/importExport';

import {Conversation} from '@/types/chat';
import {LatestExportFormat, SupportedExportFormats} from '@/types/export';
import {OpenAIModels} from '@/types/openai';
import {PluginKey} from '@/types/plugin';

import HomeContext from '@/pages/api/home/home.context';
import {ChatbarSettings} from './components/ChatbarSettings';

import Sidebar from '../Sidebar';
import ChatbarContext from './Chatbar.context';
import {ChatbarInitialState, initialState} from './Chatbar.state';

import {v4 as uuidv4} from 'uuid';
import {Accordion, AccordionItem} from "@nextui-org/react";
import {Conversations} from "@/components/Chatbar/components/Conversations";

export interface Project {
  id: string;
  name: string;
  author: string;
  threads: Thread[];
  createdAt: string;
  modifiedAt: string;
}

interface Thread {
  id: string;
  name: string;
  createdAt: string;
  modifiedAt: string;
  context: string;
  conversations: Conversation[];
}

const projects: Project[] = [
  {
    id: '1',
    name: 'Project 1',
    author: 'Author 1',
    threads: [
      {
        id: '1',
        name: 'Thread 1',
        createdAt: '2021-01-01',
        modifiedAt: '2021-01-02',
        context: 'Context 1',
        conversations: [
          {
            id: '1',
            name: 'Conversation 1',
            messages: [
              {
                role: 'assistant',
                content: 'Message 1'
              },
              {
                role: 'user',
                content: 'Message 2'
              }
            ],
            prompt: 'Prompt 1'
          }
        ]
      },
      {
        id: '11',
        name: 'Thread 11',
        createdAt: '2021-01-01',
        modifiedAt: '2021-01-02',
        context: 'Context 1',
        conversations: [
          {
            id: '11',
            name: 'Conversation 1',
            messages: [
              {
                role: 'assistant',
                content: 'Message 1'
              },
              {
                role: 'user',
                content: 'Message 2'
              }
            ],
            prompt: 'Prompt 1'
          }
        ]
      }
    ],
    createdAt: '2021-01-01',
    modifiedAt: '2021-01-02'
  },
  {
    id: '2',
    name: 'Project 2',
    author: 'Author 2',
    threads: [
      {
        id: '2',
        name: 'Thread 2',
        createdAt: '2021-02-01',
        modifiedAt: '2021-02-02',
        context: 'Context 2',
        conversations: [
          {
            id: '2',
            name: 'Conversation 2',
            messages: [
              {
                role: 'assistant',
                content: 'Message 3'
              },
              {
                role: 'user',
                content: 'Message 4'
              }
            ],
            prompt: 'Prompt 2'
          }
        ]
      }
    ],
    createdAt: '2021-02-01',
    modifiedAt: '2021-02-02'
  },
  {
    id: '3',
    name: 'Project 3',
    author: 'Author 3',
    threads: [
      {
        id: '3',
        name: 'Thread 3',
        createdAt: '2021-03-01',
        modifiedAt: '2021-03-02',
        context: 'Context 3',
        conversations: [
          {
            id: '3',
            name: 'Conversation 3',
            messages: [
              {
                role: 'assistant',
                content: 'Message 5'
              },
              {
                role: 'user',
                content: 'Message 6'
              }
            ],
            prompt: 'Prompt 3'
          }
        ]
      }
    ],
    createdAt: '2021-03-01',
    modifiedAt: '2021-03-02'
  }
];

function Ala() {
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <Accordion variant='shadow'>
      {projects.map((project) => {
        return (
          <AccordionItem key={project.id} title={project.name}>
            <Accordion isCompact={true} variant='light'>
              {project.threads.map((thread) => {
                return (
                  <AccordionItem key={thread.id} title={thread.name}>
                      <Conversations conversations={thread.conversations}/>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export const Chatbar = () => {
  const { t } = useTranslation('sidebar');

  const chatBarContextValue = useCreateReducer<ChatbarInitialState>({
    initialState,
  });

  const {
    state: { conversations, showChatbar, defaultModelId, folders, pluginKeys },
    dispatch: homeDispatch,
    handleCreateFolder,
    handleNewConversation,
    handleUpdateConversation,
  } = useContext(HomeContext);

  const {
    state: { searchTerm, filteredConversations },
    dispatch: chatDispatch,
  } = chatBarContextValue;

  const handleApiKeyChange = useCallback(
    (apiKey: string) => {
      homeDispatch({ field: 'apiKey', value: apiKey });

      localStorage.setItem('apiKey', apiKey);
    },
    [homeDispatch],
  );

  const handlePluginKeyChange = (pluginKey: PluginKey) => {
    if (pluginKeys.some((key) => key.pluginId === pluginKey.pluginId)) {
      const updatedPluginKeys = pluginKeys.map((key) => {
        if (key.pluginId === pluginKey.pluginId) {
          return pluginKey;
        }

        return key;
      });

      homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys });

      localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
    } else {
      homeDispatch({ field: 'pluginKeys', value: [...pluginKeys, pluginKey] });

      localStorage.setItem(
        'pluginKeys',
        JSON.stringify([...pluginKeys, pluginKey]),
      );
    }
  };

  const handleClearPluginKey = (pluginKey: PluginKey) => {
    const updatedPluginKeys = pluginKeys.filter(
      (key) => key.pluginId !== pluginKey.pluginId,
    );

    if (updatedPluginKeys.length === 0) {
      homeDispatch({ field: 'pluginKeys', value: [] });
      localStorage.removeItem('pluginKeys');
      return;
    }

    homeDispatch({ field: 'pluginKeys', value: updatedPluginKeys });

    localStorage.setItem('pluginKeys', JSON.stringify(updatedPluginKeys));
  };

  const handleExportData = () => {
    exportData();
  };

  const handleImportConversations = (data: SupportedExportFormats) => {
    const { history, folders, prompts }: LatestExportFormat = importData(data);
    homeDispatch({ field: 'conversations', value: history });
    homeDispatch({
      field: 'selectedConversation',
      value: history[history.length - 1],
    });
    homeDispatch({ field: 'folders', value: folders });
    homeDispatch({ field: 'prompts', value: prompts });

    window.location.reload();
  };

  const handleClearConversations = () => {
    defaultModelId &&
      homeDispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('New Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });

    homeDispatch({ field: 'conversations', value: [] });

    localStorage.removeItem('conversationHistory');
    localStorage.removeItem('selectedConversation');

    const updatedFolders = folders.filter((f) => f.type !== 'chat');

    homeDispatch({ field: 'folders', value: updatedFolders });
    saveFolders(updatedFolders);
  };

  const handleDeleteConversation = (conversation: Conversation) => {
    const updatedConversations = conversations.filter(
      (c) => c.id !== conversation.id,
    );

    homeDispatch({ field: 'conversations', value: updatedConversations });
    chatDispatch({ field: 'searchTerm', value: '' });
    saveConversations(updatedConversations);

    if (updatedConversations.length > 0) {
      homeDispatch({
        field: 'selectedConversation',
        value: updatedConversations[updatedConversations.length - 1],
      });

      saveConversation(updatedConversations[updatedConversations.length - 1]);
    } else {
      defaultModelId &&
        homeDispatch({
          field: 'selectedConversation',
          value: {
            id: uuidv4(),
            name: t('New Conversation'),
            messages: [],
            model: OpenAIModels[defaultModelId],
            prompt: DEFAULT_SYSTEM_PROMPT,
            temperature: DEFAULT_TEMPERATURE,
            folderId: null,
          },
        });

      localStorage.removeItem('selectedConversation');
    }
  };

  const handleToggleChatbar = () => {
    homeDispatch({ field: 'showChatbar', value: !showChatbar });
    localStorage.setItem('showChatbar', JSON.stringify(!showChatbar));
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const conversation = JSON.parse(e.dataTransfer.getData('conversation'));
      handleUpdateConversation(conversation, { key: 'folderId', value: 0 });
      chatDispatch({ field: 'searchTerm', value: '' });
      e.target.style.background = 'none';
    }
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
        handleDeleteConversation,
        handleClearConversations,
        handleImportConversations,
        handleExportData,
        handlePluginKeyChange,
        handleClearPluginKey,
        handleApiKeyChange,
      }}
    >
      <Sidebar<Project>
        side={'left'}
        isOpen={showChatbar}
        addItemButtonTitle={t('New chat')}
        itemComponent={<Ala/>}
        items={projects}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          chatDispatch({ field: 'searchTerm', value: searchTerm })
        }
        toggleOpen={handleToggleChatbar}
        handleCreateItem={handleNewConversation}
        handleDrop={handleDrop}
        footerComponent={<ChatbarSettings />}
      />
    </ChatbarContext.Provider>
  );
};
