'use client';

import { useState } from 'react';
import { Task, Tag } from '@/types';
import { Plus, Check, Clock, Trash2, Tag as TagIcon } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onTasksChange: (tasks: Task[]) => void;
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const categoryColors: Record<Task['category'], string> = {
  business: 'bg-purple-900/50 text-purple-300 border-purple-700',
  cert: 'bg-blue-900/50 text-blue-300 border-blue-700',
  health: 'bg-green-900/50 text-green-300 border-green-700',
  spanish: 'bg-yellow-900/50 text-yellow-300 border-yellow-700',
  trading: 'bg-orange-900/50 text-orange-300 border-orange-700',
  creative: 'bg-pink-900/50 text-pink-300 border-pink-700',
  other: 'bg-gray-700 text-gray-300 border-gray-600',
};

const priorityColors: Record<Task['priority'], string> = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-green-500',
};

const tagColors = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Gray', value: '#6b7280' },
];

export function TaskManager({ tasks, onTasksChange, tags, onTagsChange }: TaskManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'other' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: '',
    tagIds: [] as string[]
  });
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [showNewTagForm, setShowNewTagForm] = useState(false);

  const createNewTag = () => {
    if (!newTagName.trim()) return;
    const tag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: newTagColor,
    };
    onTagsChange([...tags, tag]);
    setNewTagName('');
    setNewTagColor('#3b82f6');
    setShowNewTagForm(false);
  };

  const deleteTag = (id: string) => {
    onTagsChange(tags.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: newTask.dueDate || undefined,
      tagIds: newTask.tagIds,
    };
    
    onTasksChange([task, ...tasks]);
    setNewTask({ title: '', description: '', category: 'other', priority: 'medium', dueDate: '', tagIds: [] });
    setShowAddForm(false);
  };

  const toggleTask = (id: string) => {
    onTasksChange(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id: string) => {
    onTasksChange(tasks.filter(t => t.id !== id));
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Tasks
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTagManager(!showTagManager)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
          >
            <TagIcon className="w-4 h-4" />
            Tags
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-black rounded-lg text-sm hover:bg-gray-200 transition"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Tag Manager */}
      {showTagManager && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Manage Tags</h3>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Tag name..."
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400"
            />
            <div className="flex gap-1">
              {tagColors.map(color => (
                <button
                  key={color.value}
                  onClick={() => setNewTagColor(color.value)}
                  className={`w-6 h-6 rounded-full transition ${newTagColor === color.value ? 'ring-2 ring-white' : ''}`}
                  style={{ backgroundColor: color.value }}
                />
              ))}
            </div>
            <button
              onClick={createNewTag}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Add
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: tag.color + '30', color: tag.color, border: `1px solid ${tag.color}` }}
              >
                {tag.name}
                <button onClick={() => deleteTag(tag.id)} className="hover:opacity-70">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-gray-800 p-4 rounded-lg space-y-3 border border-gray-700">
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400"
            autoFocus
          />
          <textarea
            placeholder="Description (optional)..."
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 resize-none"
            rows={2}
          />
          <div className="flex gap-3 flex-wrap">
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Task['category'] })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            >
              <option value="business">Business</option>
              <option value="cert">Cert</option>
              <option value="health">Health</option>
              <option value="spanish">Spanish</option>
              <option value="trading">Trading</option>
              <option value="creative">Creative</option>
              <option value="other">Other</option>
            </select>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            />
          </div>

          {/* Tag selector */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setNewTask({
                      ...newTask,
                      tagIds: newTask.tagIds.includes(tag.id)
                        ? newTask.tagIds.filter(t => t !== tag.id)
                        : [...newTask.tagIds, tag.id]
                    })}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      newTask.tagIds.includes(tag.id) ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ 
                      backgroundColor: newTask.tagIds.includes(tag.id) ? tag.color : tag.color + '30', 
                      color: newTask.tagIds.includes(tag.id) ? 'white' : tag.color,
                      border: `1px solid ${tag.color}`
                    }}
                  >
                    {newTask.tagIds.includes(tag.id) && <Plus className="w-3 h-3 inline mr-1" />}
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addTask}
            className="w-full px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-200 font-medium"
          >
            Add Task
          </button>
        </div>
      )}

      {/* Active Tasks */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400">
          To Do ({incompleteTasks.length})
        </h3>
        {incompleteTasks.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">All caught up! 🎉</p>
        ) : (
          <div className="space-y-2">
            {incompleteTasks.map(task => (
              <div
                key={task.id}
                className={`bg-gray-800 p-3 rounded-lg border-l-4 shadow-sm flex items-start gap-3 ${priorityColors[task.priority]}`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 w-5 h-5 border-2 border-gray-500 rounded-full hover:border-green-500 hover:bg-green-500/20 transition flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{task.title}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[task.category]}`}>
                      {task.category}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-400">{task.dueDate}</span>
                    )}
                    {task.tagIds.map(tagId => {
                      const tag = tags.find(t => t.id === tagId);
                      if (!tag) return null;
                      return (
                        <span
                          key={tagId}
                          className="px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ backgroundColor: tag.color, color: 'white' }}
                        >
                          {tag.name}
                        </span>
                      );
                    })}
                  </div>
                  {task.description && (
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  )}
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-1">
            {completedTasks.map(task => (
              <div
                key={task.id}
                className="bg-gray-800/50 p-2 rounded-lg flex items-center gap-3 opacity-50"
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-0.5 w-5 h-5 bg-green-500 border-green-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-white text-xs">✓</span>
                </button>
                <span className="text-sm text-gray-400 line-through">{task.title}</span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="ml-auto text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
