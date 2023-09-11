import {Project, Thread} from "@/components/Chatbar/Chatbar";
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

// similar method for create Theread
export const handleCreateThreadInProject = async (projectId: string, thread: Thread) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === projectId) {
      return {
        ...p,
        threads: [...p.threads, thread],
      };
    }
    return p;
  });

  saveProject(updatedStorage);
}

export const handleUpdateThreadInProject = async (projectId: string, thread: Thread) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === projectId) {
      return {
        ...p,
        threads: p.threads.map((t: Thread) => {
          if (t.id === thread.id) {
            return thread;
          }
          return t;
        }),
      };
    }
    return p;
  });

  saveProject(updatedStorage);
}

export const handleDeleteThreadInProject = async (projectId: string, threadId: string) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === projectId) {
      return {
        ...p,
        threads: p.threads.filter((t: Thread) => t.id !== threadId),
      };
    }
    return p;
  });

  saveProject(updatedStorage);
}

// create method for conversation in thread
export const handleCreateConversationInThread = async (projectId: string, threadId: string, conversation: Conversation) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === projectId) {
      return {
        ...p,
        threads: p.threads.map((t: Thread) => {
          if (t.id === threadId) {
            return {
              ...t,
              conversations: [...t.conversations, conversation],
            };
          }
          return t;
        }),
      };
    }
    return p;
  });

  saveProject(updatedStorage);
}

export const handleUpdateConversationInThread = async (projectId: string, threadId: string, conversation: Conversation) => {
  const projsStorageObj = localStorage.getItem('projects');
  const projsStorage = projsStorageObj ? JSON.parse(projsStorageObj) : [] as Project[];

  const updatedStorage = projsStorage.map((p: Project) => {
    if (p.id === projectId) {
      return {
        ...p,
        threads: p.threads.map((t: Thread) => {
          if (t.id === threadId) {
            return {
              ...t,
              conversations: t.conversations.map((c: any) => {
                if (c.id === conversation.id) {
                  return conversation;
                }
                return c;
              }),
            };
          }
          return t;
        }),
      };
    }
    return p;
  });

  saveProject(updatedStorage);
  const conversations = projsStorage.find((p: Project) => p.id === projectId).threads.find((t: Thread) => t.id === threadId).conversations;

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
