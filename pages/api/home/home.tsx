import React, {useEffect, useRef} from 'react';
import {useQuery} from 'react-query';

import {GetServerSideProps} from 'next';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Head from 'next/head';

import {useCreateReducer} from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {cleanConversationHistory, cleanSelectedConversation,} from '@/utils/app/clean';
import {DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE} from '@/utils/app/const';
import {getSettings} from '@/utils/app/settings';

import {Conversation} from '@/types/chat';
import {KeyValuePair} from '@/types/data';
import {fallbackModelID, OpenAIModelID, OpenAIModels} from '@/types/openai';

import HomeContext from './home.context';
import {HomeInitialState, initialState} from './home.state';

import {v4 as uuidv4} from 'uuid';
import {
  handleCreateProject,
  handleDeleteProject,
  handleUpdateConversationInProject,
  handleUpdateProject,
  saveConversation
} from "@/utils/app/projs_threads";
import {Chatbar} from "@/components/Chatbar/Chatbar";
import Promptbar from "@/components/Promptbar";
import {Chat} from "@/components/Chat/Chat";
import {Navbar} from "@/components/Mobile/Navbar";

interface Props {
  serverSideApiKeyIsSet: boolean;
  serverSidePluginKeysSet: boolean;
  defaultModelId: OpenAIModelID;
}

const Home = ({
  serverSideApiKeyIsSet,
  serverSidePluginKeysSet,
  defaultModelId,
}: Props) => {
  const {t} = useTranslation('sidebar');
  const {getModels} = useApiService();
  const {getModelsError} = useErrorService();


  const contextValue = useCreateReducer<HomeInitialState>({
    initialState,
  });

  const {
    state: {
      apiKey,
      lightMode,
      selectedConversation,
      projects,
    },
    dispatch,
  } = contextValue;

  const stopConversationRef = useRef<boolean>(false);

  const {data, error} = useQuery(
    ['GetModels', apiKey, serverSideApiKeyIsSet],
    ({signal}) => {
      if (!apiKey && !serverSideApiKeyIsSet) return null;

      return getModels(
        {
          key: apiKey,
        },
        signal,
      );
    },
    {enabled: true, refetchOnMount: false},
  );

  useEffect(() => {
    if (data) dispatch({field: 'models', value: data});
  }, [data, dispatch]);

  useEffect(() => {
    dispatch({field: 'modelError', value: getModelsError(error)});
  }, [dispatch, error, getModelsError]);

  // FETCH MODELS ----------------------------------------------

  const handleSelectConversation = (conversation: Conversation) => {
    dispatch({
      field: 'selectedConversation',
      value: conversation,
    });

    saveConversation(conversation);
  };

  const handleSelectProj = (projectId: string) => {
    dispatch({
      field: 'selectedProjectId',
      value: {projectId},
    });

    localStorage.setItem('selectedProjId', projectId);
  };

  const handleNewConversation = async (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)!;
    const conversations = project.conversations;

    const newConversation: Conversation = {
      id: uuidv4(),
      name: t('New conversation'),
      messages: [],
      includedOutcomesFromConversationIds: [],
      prompt: DEFAULT_SYSTEM_PROMPT,
      outcome: '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      context: '',
      snippets: [],
    };

    const updatedConversations = [...conversations || [], newConversation];

    project.conversations = updatedConversations

    dispatch({field: 'selectedConversation', value: newConversation});

    dispatch({field: 'conversations', value: updatedConversations});
    saveConversation(newConversation);

    await handleUpdateProject(project);
    const updatedProjects = projects.map((p) => p.id === projectId ? project : p);
    dispatch({field: 'projects', value: updatedProjects});
    dispatch({field: 'loading', value: false});
  };

  const handleDeleteConversation = async (projectId: string, conversationId: string) => {
    const project = projects.find((p) => p.id === projectId)!;
    const conversations = project.conversations.filter((c) => c.id !== conversationId);

    const updatedConversations = [...conversations ];

    project.conversations = updatedConversations

    dispatch({field: 'selectedConversation', value: {}});

    dispatch({field: 'conversations', value: updatedConversations});

    await handleUpdateProject(project);
    const updatedProjects = projects.map((p) => p.id === projectId ? project : p);
    dispatch({field: 'projects', value: updatedProjects});
  };

  const handleUpdateConversation = async (
    projectId: string,
    conversation: Conversation,
    data: KeyValuePair,
  ) => {
    const updatedConversation = {
      ...conversation,
      [data.key]: data.value,
    };

    const {single} = await handleUpdateConversationInProject(projectId,
      updatedConversation,
    );

    dispatch({field: 'selectedConversation', value: single});
  };

  // EFFECTS  --------------------------------------------

  useEffect(() => {
    if (window.innerWidth < 640) {
      dispatch({field: 'showChatbar', value: false});
    }
  }, [selectedConversation]);

  useEffect(() => {
    defaultModelId &&
    dispatch({field: 'defaultModelId', value: defaultModelId});
    serverSideApiKeyIsSet &&
    dispatch({
      field: 'serverSideApiKeyIsSet',
      value: serverSideApiKeyIsSet,
    });
    serverSidePluginKeysSet &&
    dispatch({
      field: 'serverSidePluginKeysSet',
      value: serverSidePluginKeysSet,
    });
  }, [defaultModelId, serverSideApiKeyIsSet, serverSidePluginKeysSet]);

  // ON LOAD --------------------------------------------

  useEffect(() => {
    const settings = getSettings();
    if (settings.theme) {
      dispatch({
        field: 'lightMode',
        value: settings.theme,
      });
    }

    const apiKey = localStorage.getItem('apiKey');

    if (serverSideApiKeyIsSet) {
      dispatch({field: 'apiKey', value: ''});

      localStorage.removeItem('apiKey');
    } else if (apiKey) {
      dispatch({field: 'apiKey', value: apiKey});
    }

    const pluginKeys = localStorage.getItem('pluginKeys');
    if (serverSidePluginKeysSet) {
      dispatch({field: 'pluginKeys', value: []});
      localStorage.removeItem('pluginKeys');
    } else if (pluginKeys) {
      dispatch({field: 'pluginKeys', value: pluginKeys});
    }

    if (window.innerWidth < 640) {
      dispatch({field: 'showChatbar', value: false});
      dispatch({field: 'showPromptbar', value: false});
    }

    const showChatbar = localStorage.getItem('showChatbar');
    if (showChatbar) {
      dispatch({field: 'showChatbar', value: showChatbar === 'true'});
    }

    const showPromptbar = localStorage.getItem('showPromptbar');
    if (showPromptbar) {
      dispatch({field: 'showPromptbar', value: showPromptbar === 'true'});
    }

    const folders = localStorage.getItem('folders');
    if (folders) {
      dispatch({field: 'folders', value: JSON.parse(folders)});
    }

    const prompts = localStorage.getItem('prompts');
    if (prompts) {
      dispatch({field: 'prompts', value: JSON.parse(prompts)});
    }

    const conversationHistory = localStorage.getItem('conversationHistory');
    if (conversationHistory) {
      const parsedConversationHistory: Conversation[] =
        JSON.parse(conversationHistory);
      const cleanedConversationHistory = cleanConversationHistory(
        parsedConversationHistory,
      );

      dispatch({field: 'conversations', value: cleanedConversationHistory});
    }

    const selectedConversation = localStorage.getItem('selectedConversation');
    if (selectedConversation) {
      const parsedSelectedConversation: Conversation =
        JSON.parse(selectedConversation);
      const cleanedSelectedConversation = cleanSelectedConversation(
        parsedSelectedConversation,
      );

      dispatch({
        field: 'selectedConversation',
        value: cleanedSelectedConversation,
      });
    } else {

      dispatch({
        field: 'selectedConversation',
        value: {
          id: uuidv4(),
          name: t('cew Conversation'),
          messages: [],
          model: OpenAIModels[defaultModelId],
          prompt: DEFAULT_SYSTEM_PROMPT,
          temperature: DEFAULT_TEMPERATURE,
          folderId: null,
        },
      });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
    serverSidePluginKeysSet,
  ]);

  return (
    <HomeContext.Provider
      value={{
        ...contextValue,
        handleNewConversation,
        handleSelectConversation,
        handleSelectProj,
        handleCreateProject,
        handleDeleteProject,
        handleUpdateProject,
        handleUpdateConversation,
        handleDeleteConversation
      }}
    >
      <Head>
        <title>Chatbot UI</title>
        <meta name="description" content="ChatGPT but better."/>
        <meta
          name="viewport"
          content="height=device-height ,width=device-width, initial-scale=1, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico"/>
      </Head>
      {selectedConversation && (
        <main
          className={`flex h-screen w-screen flex-col text-sm text-white dark:text-white ${lightMode}`}
        >
          <div className="fixed top-0 w-full sm:hidden">
            <Navbar
              selectedConversation={selectedConversation}
              onNewConversation={handleNewConversation}
            />
          </div>

          <div className="flex h-full w-full pt-[48px] sm:pt-0">
            <Chatbar/>

            <div className="flex flex-1">
              <Chat stopConversationRef={stopConversationRef}/>
            </div>

            <Promptbar/>
          </div>
        </main>
      )}
    </HomeContext.Provider>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  const defaultModelId =
    (process.env.DEFAULT_MODEL &&
      Object.values(OpenAIModelID).includes(
        process.env.DEFAULT_MODEL as OpenAIModelID,
      ) &&
      process.env.DEFAULT_MODEL) ||
    fallbackModelID;

  let serverSidePluginKeysSet = false;

  const googleApiKey = process.env.GOOGLE_API_KEY;
  const googleCSEId = process.env.GOOGLE_CSE_ID;

  if (googleApiKey && googleCSEId) {
    serverSidePluginKeysSet = true;
  }

  return {
    props: {
      serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
      defaultModelId,
      serverSidePluginKeysSet,
      ...(await serverSideTranslations(locale ?? 'en', [
        'common',
        'chat',
        'sidebar',
        'markdown',
        'promptbar',
        'settings',
      ])),
    },
  };
};
