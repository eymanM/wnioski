import {Conversations} from "@/components/Chatbar/components/Conversations";
import {IconPlus} from "@tabler/icons-react";
import {Project} from "@/components/Chatbar/Chatbar";
import {useState} from "react";

interface Props {
  projects: Project[];
  handleCreateThreadInProject: (projectId: string) => Promise<void>;
  handleCreateProject: (name: string) => Promise<void>;
  handleCreateConversation: (projectId: string, threadId: string) => Promise<void>;
}

export const CollapsedAccordition = ({projects, handleCreateProject, handleCreateThreadInProject, handleCreateConversation}: Props) => {
  const [isAccordionOpen, setAccordionOpen] = useState(false);
  const [isInnerAccordionOpen, setInnerAccordionOpen] = useState(false);
  return (
    <div>
      <div className="flex items-center">
        <button
          className="text-sidebar flex w-full flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10 relative"
          onClick={() => {
            handleCreateProject('New project');
          }}
        >
          <IconPlus size={16}/>
          Add new project
        </button>
      </div>
      {
        projects.map((project) => (
          <div key={project.id}>
            <div
              className='flex w-full justify-between p-2 my-2 hover:bg-gray-900 rounded cursor-pointer'
              onClick={() => setAccordionOpen(!isAccordionOpen)}
            >
              <div className='flex cursor-default'>
                <div className='flex items-center'>{project.name}</div>
              </div>

              <button
                onClick={async (e) => {
                  setAccordionOpen(true);
                  e.stopPropagation();
                  await handleCreateThreadInProject(project.id);
                }}
                className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10 hover:bg-gray-500/20 transition-colors duration-200'
                title='Add new project'
              >
                <IconPlus size={16}/>
              </button>

            </div>

            {isAccordionOpen && (
              <div>
                {project.threads.map((thread) => (
                  <div
                    key={thread.id}
                    className='flex justify-between p-2 my-2 m-4 cursor-pointer rounded shadow-sm hover:bg-gray-600'
                    onClick={() => setInnerAccordionOpen(!isInnerAccordionOpen)}
                  >
                    {thread.name}
                    <button
                      onClick={async (e) => {
                        setInnerAccordionOpen(true);
                        e.stopPropagation();
                        await handleCreateConversation(project.id, thread.id);
                      }}
                      className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10 hover:bg-gray-500/20 transition-colors duration-200'
                      title='Add new project'
                    >
                      <IconPlus size={16}/>
                    </button>
                    {isInnerAccordionOpen && (
                      <Conversations conversations={thread.conversations}/>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
    </div>
  )
};
