import React, {useEffect, useRef} from 'react';
import {useQuery} from 'react-query';

import Head from 'next/head';

import {useCreateReducer} from '@/hooks/useCreateReducer';

import useErrorService from '@/services/errorService';
import useApiService from '@/services/useApiService';

import {cleanConversationHistory, cleanSelectedConversation,} from '@/utils/app/clean';
import {DEFAULT_SYSTEM_PROMPT} from '@/utils/app/const';
import {getSettings} from '@/utils/app/settings';

import {Conversation} from '@/types/chat';
import {KeyValuePair} from '@/types/data';
import {fallbackModelID, OpenAIModelID} from '@/types/openai';

import HomeContext from './home.context';
import {HomeInitialState, initialState} from './home.state';

import {v4 as uuidv4} from 'uuid';
import {
  handleCreateProject,
  handleDeleteProject,
  handleUpdateConversationInProject,
  handleUpdateProject,
  saveConversation
} from "@/utils/app/projects";
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
  defaultModelId,
}: Props) => {
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
      name: 'New conversation',
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

    const updatedConversations = [...conversations];
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
  }, [defaultModelId, serverSideApiKeyIsSet]);

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

    const snippets = localStorage.getItem('snippets');
    if (snippets) {
      dispatch({field: 'snippets', value: JSON.parse(snippets)});
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
        value: {}
      });
    }
  }, [
    defaultModelId,
    dispatch,
    serverSideApiKeyIsSet,
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

// export const getServerSideProps: GetServerSideProps = async ({locale}) => {
//   const defaultModelId =
//     (process.env.DEFAULT_MODEL &&
//       Object.values(OpenAIModelID).includes(
//         process.env.DEFAULT_MODEL as OpenAIModelID,
//       ) &&
//       process.env.DEFAULT_MODEL) ||
//     fallbackModelID;
//
//   return {
//     props: {
//       serverSideApiKeyIsSet: !!process.env.OPENAI_API_KEY,
//       defaultModelId,
//     },
//   };
// };
