import {Snippet} from '@/types/snippet';

interface Props {
  prompt: Snippet;
  variables: string[];
  onSubmit: (updatedVariables: string[]) => void;
  onClose: () => void;
}


