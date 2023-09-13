import {createContext, Dispatch} from 'react';

import {ActionType} from '@/hooks/useCreateReducer';

import {ChatbarInitialState} from './Chatbar.state';

export interface ChatbarContextProps {
  state: ChatbarInitialState;
  dispatch: Dispatch<ActionType<ChatbarInitialState>>;
}

const ChatbarContext = createContext<ChatbarContextProps>(undefined!);

export default ChatbarContext;
