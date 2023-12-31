import {memo, MutableRefObject, useCallback, useContext, useEffect, useRef, useState,} from 'react';
import toast from 'react-hot-toast';

import {getEndpoint} from '@/utils/app/api';
import {throttle} from '@/utils/data/throttle';

import {ChatBody, Conversation, Message} from '@/types/chat';

import HomeContext from '@/pages/api/home/home.context';

import Spinner from '../Spinner';
import {ChatInput} from './ChatInput';
import {ChatLoader} from './ChatLoader';
import {ErrorMessageDiv} from './ErrorMessageDiv';
import {MemoizedChatMessage} from './MemoizedChatMessage';

interface Props {
  stopConversationRef: MutableRefObject<boolean>;
}

export const Chat = memo(({stopConversationRef}: Props) => {
  const {
    state: {
      selectedConversation,
      conversations,
      projects,
      apiKey,
      serverSideApiKeyIsSet,
      modelError,
      loading,
      selectedProjectId
    },
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const [currentMessage, setCurrentMessage] = useState<Message>();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);

  const [showScrollDownButton, setShowScrollDownButton] =
    useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(
    async (message: Message, deleteCount = 0, plugin: Plugin | null = null) => {
      if (selectedConversation) {
        let updatedConversation: Conversation;
        if (deleteCount) {
          const updatedMessages = [...selectedConversation.messages];
          for (let i = 0; i < deleteCount; i++) {
            updatedMessages.pop();
          }
          updatedConversation = {
            ...selectedConversation,
            messages: [...updatedMessages, message],
          };
        } else {
          updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
          };
        }
        homeDispatch({
          field: 'selectedConversation',
          value: updatedConversation,
        });
        homeDispatch({field: 'loading', value: true});
        homeDispatch({field: 'messageIsStreaming', value: true});
        const chatBody: ChatBody = {
          messages: updatedConversation.messages,
          key: apiKey,
          prompt: updatedConversation.prompt,
        };
        const endpoint = getEndpoint();
        let body;

        body = JSON.stringify(chatBody);

        const controller = new AbortController();
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body,
        });
        if (!response.ok) {
          homeDispatch({field: 'loading', value: false});
          homeDispatch({field: 'messageIsStreaming', value: false});
          toast.error(response.statusText);
          return;
        }
        const data = response.body;
        if (!data) {
          homeDispatch({field: 'loading', value: false});
          homeDispatch({field: 'messageIsStreaming', value: false});
          return;
        }

        if (updatedConversation.messages.length === 1) {
          const {content} = message;
          const customName =
            content.length > 30 ? content.substring(0, 30) + '...' : content;
          updatedConversation = {
            ...updatedConversation,
            name: customName,
          };
        }
        homeDispatch({field: 'loading', value: false});
        const reader = data.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let isFirst = true;
        let text = '';
        while (!done) {
          if (stopConversationRef.current) {
            controller.abort();
            done = true;
            break;
          }
          const {value, done: doneReading} = await reader.read();
          done = doneReading;
          const chunkValue = decoder.decode(value);
          text += chunkValue;
          if (isFirst) {
            isFirst = false;
            const updatedMessages: Message[] = [
              ...updatedConversation.messages,
              {role: 'assistant', content: chunkValue},
            ];
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
          } else {
            const updatedMessages: Message[] =
              updatedConversation.messages.map((message, index) => {
                if (index === updatedConversation.messages.length - 1) {
                  return {
                    ...message,
                    content: text,
                  };
                }
                return message;
              });
            updatedConversation = {
              ...updatedConversation,
              messages: updatedMessages,
            };
            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
            const proj = projects.find((proj) => proj.id === selectedProjectId!)!;
            proj.conversations = proj.conversations?.map((conv) => {
              if (conv.id === selectedConversation.id) {
                return updatedConversation;
              }
              return conv;
            }) || [];

            const updatedProjects = projects.map((proj) => {
              if (proj.id === selectedProjectId) {
                return proj;
              }
              return proj;
            });

            homeDispatch({field: 'projects', value: updatedProjects});
            localStorage.setItem('projects', JSON.stringify(updatedProjects));

            homeDispatch({
              field: 'selectedConversation',
              value: updatedConversation,
            });
          }
        }
        //saveConversation(updatedConversation);
        const updatedConversations: Conversation[] = conversations.map(
          (conversation) => {
            if (conversation.id === selectedConversation.id) {
              return updatedConversation;
            }
            return conversation;
          },
        );
        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation);
        }
        homeDispatch({field: 'conversations', value: updatedConversations});
        //saveConversations(updatedConversations);
        homeDispatch({field: 'messageIsStreaming', value: false});
      }
    },
    [
      apiKey,
      conversations,
      selectedConversation,
      selectedProjectId,
      stopConversationRef,
    ],
  );

  useCallback(() => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
      textareaRef.current?.focus();
    }
  }, [autoScrollEnabled]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const {scrollTop, scrollHeight, clientHeight} =
        chatContainerRef.current;
      const bottomTolerance = 30;

      if (scrollTop + clientHeight < scrollHeight - bottomTolerance) {
        setAutoScrollEnabled(false);
        setShowScrollDownButton(true);
      } else {
        setAutoScrollEnabled(true);
        setShowScrollDownButton(false);
      }
    }
  };

  const handleScrollDown = () => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  };


  const scrollDown = () => {
    if (autoScrollEnabled) {
      messagesEndRef.current?.scrollIntoView(true);
    }
  };
  const throttledScrollDown = throttle(scrollDown, 250);


  useEffect(() => {
    if (selectedConversation) {
      throttledScrollDown();

      selectedConversation &&
      setCurrentMessage(
        selectedConversation.messages?.[selectedConversation.messages.length - 2],
      );
    }
  }, [selectedConversation, throttledScrollDown]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setAutoScrollEnabled(entry.isIntersecting);
        if (entry.isIntersecting) {
          textareaRef.current?.focus();
        }
      },
      {
        root: null,
        threshold: 0.5,
      },
    );
    const messagesEndElement = messagesEndRef.current;
    if (messagesEndElement) {
      observer.observe(messagesEndElement);
    }
    return () => {
      if (messagesEndElement) {
        observer.unobserve(messagesEndElement);
      }
    };
  }, [messagesEndRef]);

  return (
    <div className="relative flex-1 overflow-hidden bg-white dark:bg-[#343541]">
      {(!(apiKey || serverSideApiKeyIsSet) || !selectedConversation?.id) ? (
        <div className="mx-auto flex h-full w-[300px] flex-col justify-center space-y-6 sm:w-[600px]">
          <div className="text-center text-4xl font-bold text-black dark:text-white">
            Chatbot UI
          </div>
          <div className="text-center text-gray-500 dark:text-gray-400">
            <div className="mb-2">

                Please set your OpenAI API key in the bottom left of the sidebar and then create new project and conversation.

            </div>
            <div>
              {"If you don't have an OpenAI API key, you can get one here: "}
              <a
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                openai.com
              </a>
            </div>
          </div>
        </div>
      ) : modelError ? (
        <ErrorMessageDiv error={modelError}/>
      ) : (
        <>
          <div
            className="max-h-full overflow-x-hidden"
            ref={chatContainerRef}
            onScroll={handleScroll}
          >
            {selectedConversation?.messages?.length === 0 ? (
              <>
                <div className="mx-auto flex flex-col space-y-5 md:space-y-10 px-3 pt-5 md:pt-12 sm:max-w-[600px]">
                  <div className="text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
                    Applications
                  </div>
                </div>
              </>
            ) : (
              <>
                {selectedConversation?.messages?.map((message, index) => (
                  <MemoizedChatMessage
                    key={index}
                    message={message}
                    messageIndex={index}
                    onEdit={(editedMessage) => {
                      setCurrentMessage(editedMessage);
                      // discard edited message and the ones that come after then resend
                      handleSend(
                        editedMessage,
                        selectedConversation?.messages?.length - index,
                      );
                    }}
                  />
                ))}

                {loading && <ChatLoader/>}

                <div
                  className="h-[162px] bg-white dark:bg-[#343541]"
                  ref={messagesEndRef}
                />
              </>
            )}
          </div>

          <ChatInput
            stopConversationRef={stopConversationRef}
            textareaRef={textareaRef}
            onSend={(message) => {
              setCurrentMessage(message);
              handleSend(message, 0);
            }}
            onScrollDownClick={handleScrollDown}
            onRegenerate={() => {
              if (currentMessage) {
                handleSend(currentMessage, 2, null);
              }
            }}
            showScrollDownButton={showScrollDownButton}
          />
        </>
      )}
    </div>
  );
});
Chat.displayName = 'Chat';
