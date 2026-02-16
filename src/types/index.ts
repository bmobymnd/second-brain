// Types for the 2nd Brain system

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: 'business' | 'cert' | 'health' | 'spanish' | 'trading' | 'creative' | 'other';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  dueDate?: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: 'idea' | 'business' | 'study' | 'personal' | 'trading';
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Document {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl?: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dateTime: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  completed: boolean;
  tagIds: string[];
  calendarEventId?: string;
  createdAt: string;
}

export interface DashboardStats {
  tasksCompleted: number;
  tasksPending: number;
  notesCount: number;
  docsCount: number;
}
