import {Conversations} from "@/components/Chatbar/components/Conversations";
import {IconPlus} from "@tabler/icons-react";
import {Project} from "@/components/Chatbar/Chatbar";
import {useContext, useState} from "react";
import HomeContext from "@/pages/api/home/home.context";
import {useTranslation} from "next-i18next";

interface Props {
  projects: Project[];
  handleCreateProject: (name: string) => Promise<void>;
  handleCreateConversation: (projectId: string) => Promise<void>;
}

export const CollapsedAccordition = ({projects, handleCreateProject, handleCreateConversation}: Props) => {
  const { t: tCommon } = useTranslation('common');
  const { t: tSidebar } = useTranslation('sidebar');
  const [isAccordionOpen, setAccordionOpen] = useState(false);

  const {
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  return (
    <div>
      <div className="flex items-center">
        <button
          className="text-sidebar flex w-full flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10 relative"
          onClick={async () => {
            await handleCreateProject(tSidebar('New project'));
          }}
        >
          <IconPlus size={16}/>
          {tSidebar('Add new project')}
        </button>
      </div>
      {
        projects.map((project) => (
          <div key={project.id} className={'bg-gray-500/10 hover:bg-gray-500/20 transition-colors'}>
            <div
              className='flex justify-between p-2 my-2 hover:bg-gray-900 rounded cursor-pointer'
              onClick={() => {
                setAccordionOpen((prev) => {
                  if (!prev) {
                    homeDispatch({field: 'selectedProjectId', value: project.id});
                    localStorage.setItem('selectedProjectId', project.id)
                  }
                  return !prev
                });

              }}
            >
              <div className='flex gap-2 cursor-default'>
                <div className='flex items-center'>{project.name}</div>
              </div>
              <button
                onClick={async (e) => {
                  homeDispatch({field: 'selectedProjectId', value: project.id});
                  localStorage.setItem('selectedProjectId', project.id)
                  setAccordionOpen(true);
                  e.stopPropagation();
                  await handleCreateConversation(project.id);
                }}
                className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10 hover:bg-gray-500/20 transition-colors duration-200'
                title={tSidebar('Add new conversation')!}
              >
                <IconPlus size={16}/>
              </button>

            </div>

            {isAccordionOpen && (
              <div className='ml-5'>
              <Conversations conversations={project.conversations} projectId={project.id}/>
                </div>
            )}
          </div>
        ))}
    </div>
  )
};
