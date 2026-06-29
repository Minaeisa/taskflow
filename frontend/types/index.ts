export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description: string;
  owner: User;
  members: { user: User; role: 'owner' | 'admin' | 'member' }[];
  createdAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  color: string;
  workspace: string;
  createdBy: User;
  archived: boolean;
  createdAt: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  project: string;
  createdBy: User;
  assignee?: User;
  dueDate?: string;
  order: number;
  tags: string[];
  createdAt: string;
}

export interface KanbanBoard {
  todo: Task[];
  in_progress: Task[];
  in_review: Task[];
  done: Task[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface ProjectStats {
  total: number;
  active: number;
  archived: number;
}

export interface TaskStats {
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
  total: number;
}
