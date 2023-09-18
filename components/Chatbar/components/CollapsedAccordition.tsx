import {Conversations} from "@/components/Chatbar/components/Conversations";
import {IconPlus, IconSettings2} from "@tabler/icons-react";
import {Project} from "@/components/Chatbar/Chatbar";
import {useContext, useState} from "react";
import HomeContext from "@/pages/api/home/home.context";
import {ProjectModal} from "@/components/Promptbar/components/ProjectModal";

interface Props {
  projects: Project[];
  handleCreateProject: (name: string) => Promise<void>;
  handleCreateConversation: (projectId: string) => Promise<void>;
}

export const CollapsedAccordition = ({projects, handleCreateProject, handleCreateConversation}: Props) => {

  const [isAccordionOpen, setAccordionOpen] = useState<string>('');
  const [showProjectModal, setProjectShowModal] = useState(false);


  const {
    state: {selectedProjectId},
    handleUpdateProject,
    handleDeleteProject,
    dispatch: homeDispatch,
  } = useContext(HomeContext);

  return (
    <div>
      <div className="flex items-center">
        <button
          className="text-sidebar flex w-full flex-shrink-0 cursor-pointer select-none items-center gap-3 rounded-md border border-white/20 p-3 text-white transition-colors duration-200 hover:bg-gray-500/10 relative"
          onClick={async () => {
            await handleCreateProject('New project');
          }}
        >
          <IconPlus size={16}/>
          {'Add new project'}
        </button>
      </div>
      {
        projects.map((project) => (
          <div key={project.id} className={'bg-gray-500/10 hover:bg-gray-500/20 transition-colors'}>
            <div
              className='flex justify-between p-2 my-2 hover:bg-gray-900 rounded cursor-pointer'
              onClick={() => {
                setAccordionOpen(isAccordionOpen === project.id ? '' : project.id);

              }}
            >
              <div className='flex gap-2 cursor-default'>
                <div className='flex items-center'>{project.name}</div>
              </div>
              <div className='flex gap-3 cursor-default'>
                <button
                  onClick={async (e) => {
                    homeDispatch({field: 'selectedProjectId', value: project.id});
                    setProjectShowModal(true);
                  }}
                  className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10 hover:bg-gray-500/20 transition-colors duration-200'
                  title={'Add new conversation'!}
                >
                  <IconSettings2 size={16}/>
                </button>
                <button
                  onClick={async (e) => {
                    homeDispatch({field: 'selectedProjectId', value: project.id});
                    setAccordionOpen(project.id);
                    e.stopPropagation();
                    await handleCreateConversation(project.id);
                  }}
                  className='flex items-center justify-center w-6 h-6 rounded-full bg-gray-500/10 hover:bg-gray-500/20 transition-colors duration-200'
                  title={'Add new conversation'!}
                >
                  <IconPlus size={16}/>
                </button>
              </div>

            </div>

            {isAccordionOpen === project.id && (
              <div className='ml-5'>
                <Conversations conversations={project.conversations} projectId={project.id}/>
              </div>
            )}
          </div>
        ))}
      {showProjectModal && (
        <ProjectModal
          project={projects.find(p => p.id == selectedProjectId)!}
          onClose={() => setProjectShowModal(false)}
          onUpdate={async (project: Project) => {
            const res = await handleUpdateProject(project);
            homeDispatch({field: 'projects', value: res.projects});
          }}
          onDelete={async (projecId: string) => {
            const res = await handleDeleteProject(projecId);
            homeDispatch({field: 'projects', value: res.projects});
            homeDispatch({field: 'selectedProjectId', value: ''});
            homeDispatch({field: 'selectedConversation', value: {}});
          }}
        />
      )}
    </div>
  )
};
