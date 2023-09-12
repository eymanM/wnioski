import {Project} from "@/components/Chatbar/Chatbar";
import {Conversation} from "@/types/chat";


export const getProject = async (id: string) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  return projsStorage.find((p: Project) => p.id === id);
}

export const getProjects = async () => {
  const projsStorageObj = localStorage.getItem('projects');
  return projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];
}


export const handleCreateProject = async (project: Project) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  saveProject([...projsStorage, project]);
}

// handle update project
export const handleUpdateProject = async (project: Project) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === project.id) {
      return project;
    }
    return p;
  });

  saveProject(updatedStorage);
}

export const handleDeleteProject = async (projectId: string) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.filter((p: Project) => p.id !== projectId);

  saveProject(updatedStorage);
}

export const handleCreateConversationInProject = async (projectId: string, conversation: Conversation) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === projectId) {
      return {
        ...p,
        conversations: [...p.conversations, conversation],
      };
    }
    return p;
  });

  saveProject(updatedStorage);
}

export const handleUpdateConversationInProject = async (projectId: string, conversation: Conversation) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === projectId) {
      return {
        ...p,
        conversations: p.conversations.map((c: Conversation) => {
          if (c.id === conversation.id) {
            return conversation;
          }
          return c;
        }),
      };
    }
    return p;
  });

  saveProject(updatedStorage);
  const conversations = projsStorage.find((p: Project) => p.id === projectId).conversations;

    return {
    single: conversation,
    all: conversations,
  };
}

export const saveConversation = (conversation: Conversation) => {
  localStorage.setItem('selectedConversation', JSON.stringify(conversation));
};

export const saveProject = (projs: Project[]) => {
  localStorage.setItem('projects', JSON.stringify(projs));
};
