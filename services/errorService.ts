import {useMemo} from 'react';


import {ErrorMessage} from '@/types/error';

const useErrorService = () => {

  return {
    getModelsError: useMemo(
      () => (error: any) => {
        return !error
          ? null
          : ({
            title: 'Error fetching models.',
            code: error.status || 'unknown',
            messageLines: error.statusText
              ? [error.statusText]
              : [],
          } as ErrorMessage);
      },
      [],
    ),
  };
};

export default useErrorService;
