import {FC, KeyboardEvent, useEffect, useRef, useState} from 'react';
import {Project} from "@/components/Chatbar/Chatbar";

interface Props {
  project: Project;
  onClose: () => void;
  onUpdate: (project: Project) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
}

export const ProjectModal: FC<Props> = ({project, onClose, onUpdate, onDelete}) => {
  const [projectName, setProjectName] = useState(project.name);
  const projModalRef = useRef<HTMLDivElement>(null);

  const handleEnter = async (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      await onUpdate({...project, name: projectName});
      onClose();
    }
  };

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (projModalRef.current && !projModalRef.current.contains(e.target as Node)) {
        window.addEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mouseup', handleMouseUp);
      onClose();
    };

    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose]);

  return (
    <div
      id={'project-modal-div-1'}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onKeyDown={handleEnter}
    >
      <div id={'project-modal-div-2'} className="fixed inset-0 z-10 overflow-hidden">
        <div id={'project-modal-div-3'}
             className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div
            id={'project-modal-div-4'}
            className="hidden sm:inline-block sm:h-screen sm:align-middle"
            aria-hidden="true"
          />

          <div
            id={'project-modal-div-5'}
            ref={projModalRef}
            className="dark:border-netural-500 inline-block max-h-[400px] transform overflow-y-auto rounded-lg border border-gray-300 bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all dark:bg-[#202123] sm:my-8 sm:max-h-[600px] sm:w-full sm:max-w-lg sm:p-6 sm:align-middle"
            role="dialog"
          >

            <div id={'project-modal-div-6'} className="text-sm font-bold text-black dark:text-neutral-200">
              {'Name'}
            </div>
            <textarea
              id={'project-modal-textarea-1'}
              rows={5}
              className="mt-2 w-full rounded-lg border border-neutral-500 px-4 py-2 text-neutral-900 shadow focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-[#40414F] dark:text-neutral-100"
              placeholder='Name of your AI conversation for this thread.'
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />

            <button
              type="button"
              className="w-full px-4 py-2 mt-6 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-300"
              onClick={async () => {
                const updatedProject: Project = {
                  ...project,
                  name: projectName,
                };

                await onUpdate(updatedProject);
                onClose();
              }}
            >
              {'Save'}
            </button>

            <button
              type="button"
              className="w-full px-4 py-2 mt-10 border rounded-lg shadow border-neutral-500 text-neutral-900 hover:bg-neutral-100 focus:outline-none dark:border-neutral-800 dark:border-opacity-50 dark:bg-red-400 dark:text-black dark:hover:bg-red-500"
              onClick={() => {
                onDelete(project.id);
                onClose();
              }}
            >
              {'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
