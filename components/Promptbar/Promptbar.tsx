import {useContext, useEffect} from 'react';
import {useTranslation} from 'react-i18next';

import {useCreateReducer} from '@/hooks/useCreateReducer';

import {saveSnippets} from '@/utils/app/prompts';
import {Snippet} from '@/types/snippet';

import HomeContext from '@/pages/api/home/home.context';
import {Prompts} from './components/Prompts';

import Sidebar from '../Sidebar';
import PromptbarContext from './PromptBar.context';
import {initialState, PromptbarInitialState} from './Promptbar.state';

import {v4 as uuidv4} from 'uuid';

const Promptbar = () => {


  const {t: tSidebar} = useTranslation('sidebar');

  const promptBarContextValue = useCreateReducer<PromptbarInitialState>({
    initialState,
  });

  const {
    state: {snippets: snippets, defaultModelId, showPromptbar},
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  const {
    state: {searchTerm, filteredPrompts},
    dispatch: promptDispatch,
  } = promptBarContextValue;

  const handleTogglePromptbar = () => {
    homeDispatch({field: 'showPromptbar', value: !showPromptbar});
    localStorage.setItem('showPromptbar', JSON.stringify(!showPromptbar));
  };

  const handleCreatePrompt = () => {
    if (defaultModelId) {
      const newSnippet: Snippet = {
        id: uuidv4(),
        name: `${tSidebar('Context information')} ${snippets.length + 1}`,
        description: '',
        content: '',
      };

      const updatedPrompts = [...snippets, newSnippet];
      homeDispatch({field: 'snippets', value: updatedPrompts});

      saveSnippets(updatedPrompts);
    }
  };

  const handleDeletePrompt = (snippetId: string) => {
    const updatedPrompts = snippets.filter((p) => p.id !== snippetId);

    homeDispatch({field: 'snippets', value: updatedPrompts});
    saveSnippets(updatedPrompts);
  };

  const handleUpdatePrompt = (snippet: Snippet) => {
    const updatedPrompts = snippets.map((p) => {
      if (p.id === snippet.id) {
        return snippet;
      }

      return p;
    });
    homeDispatch({field: 'snippets', value: updatedPrompts});

    saveSnippets(updatedPrompts);
  };

  const handleDrop = (e: any) => {
    if (e.dataTransfer) {
      const prompt = JSON.parse(e.dataTransfer.getData('prompt'));

      const updatedPrompt = {
        ...prompt,
        folderId: e.target.dataset.folderId,
      };

      handleUpdatePrompt(updatedPrompt);

      e.target.style.background = 'none';
    }
  };

  useEffect(() => {
    if (searchTerm) {
      promptDispatch({
        field: 'filteredPrompts',
        value: snippets.filter((prompt) => {
          const searchable =
            prompt.name.toLowerCase() +
            ' ' +
            prompt.description.toLowerCase() +
            ' ' +
            prompt.content.toLowerCase();
          return searchable.includes(searchTerm.toLowerCase());
        }),
      });
    } else {
      promptDispatch({field: 'filteredPrompts', value: snippets});
    }
  }, [searchTerm, snippets]);

  return (
    <PromptbarContext.Provider
      value={{
        ...promptBarContextValue,
        handleCreatePrompt,
        handleDeletePrompt,
        handleUpdatePrompt,
      }}
    >
      <Sidebar<Snippet>
        side={'right'}
        isOpen={showPromptbar}
        addItemButtonTitle={tSidebar('Add snippet')}
        itemComponent={
          <Prompts
            prompts={filteredPrompts}
          />
        }
        items={filteredPrompts}
        searchTerm={searchTerm}
        handleSearchTerm={(searchTerm: string) =>
          promptDispatch({field: 'searchTerm', value: searchTerm})
        }
        toggleOpen={handleTogglePromptbar}
        handleCreateItem={handleCreatePrompt}
        handleDrop={handleDrop}
      />
    </PromptbarContext.Provider>
  );
};

export default Promptbar;
