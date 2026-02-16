'use client';

import { useState } from 'react';
import { Tag, Task, Note, Reminder, Document } from '@/types';
import { Tag as TagIcon, X, Check, FileText, CheckSquare, Bell, FolderOpen } from 'lucide-react';

interface TagsManagerProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  tasks: Task[];
  notes: Note[];
  reminders: Reminder[];
  docs: Document[];
}

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

export function TagsManager({ tags, onTagsChange, tasks, notes, reminders, docs }: TagsManagerProps) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);

  const addTag = () => {
    if (!newTagName.trim()) return;
    const tag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: newTagColor,
    };
    onTagsChange([...tags, tag]);
    setNewTagName('');
    setNewTagColor('#3b82f6');
  };

  const deleteTag = (id: string) => {
    onTagsChange(tags.filter(t => t.id !== id));
    if (selectedTagId === id) setSelectedTagId(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Get items with selected tag
  const getTaggedItems = () => {
    if (!selectedTagId) return { tasks: [], notes: [], reminders: [], docs: [] };
    
    const taggedTasks = tasks.filter(t => t.tagIds.includes(selectedTagId));
    const taggedNotes = notes.filter(n => n.tagIds.includes(selectedTagId));
    const taggedReminders = reminders.filter(r => r.tagIds.includes(selectedTagId));
    const taggedDocs = docs.filter(d => d.tagIds.includes(selectedTagId));
    
    return { tasks: taggedTasks, notes: taggedNotes, reminders: taggedReminders, docs: taggedDocs };
  };

  const taggedItems = getTaggedItems();
  const selectedTag = tags.find(t => t.id === selectedTagId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TagIcon className="w-5 h-5" />
          Tags
        </h2>
      </div>

      {/* Create Tag */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
        <h3 className="text-sm font-medium">Create New Tag</h3>
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
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Tags List */}
      <div className="flex gap-2 flex-wrap">
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setSelectedTagId(selectedTagId === tag.id ? null : tag.id)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition ${
              selectedTagId === tag.id ? 'ring-2 ring-white' : ''
            }`}
            style={{ 
              backgroundColor: selectedTagId === tag.id ? tag.color : tag.color + '30', 
              color: selectedTagId === tag.id ? 'white' : tag.color,
              border: `1px solid ${tag.color}`
            }}
          >
            {tag.name}
            <button 
              onClick={(e) => { e.stopPropagation(); deleteTag(tag.id); }} 
              className="hover:opacity-70 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </button>
        ))}
        {tags.length === 0 && <span className="text-gray-500 text-sm">No tags yet. Create one above!</span>}
      </div>

      {/* Tagged Items View */}
      {selectedTag && selectedTagId && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span 
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{ backgroundColor: selectedTag.color, color: 'white' }}
            >
              {selectedTag.name}
            </span>
            <span className="text-gray-400 text-sm">
              ({taggedItems.tasks.length} tasks, {taggedItems.notes.length} notes, {taggedItems.reminders.length} reminders, {taggedItems.docs.length} docs)
            </span>
          </div>

          {/* Tasks */}
          {taggedItems.tasks.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <CheckSquare className="w-4 h-4 text-blue-400" />
                Tasks ({taggedItems.tasks.length})
              </h3>
              <div className="space-y-2">
                {taggedItems.tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${task.status === 'done' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className={task.status === 'done' ? 'line-through text-gray-500' : ''}>{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {taggedItems.notes.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-purple-400" />
                Notes ({taggedItems.notes.length})
              </h3>
              <div className="space-y-2">
                {taggedItems.notes.map(note => (
                  <div key={note.id} className="text-sm">
                    <span className="font-medium">{note.title}</span>
                    <span className="text-gray-500 text-xs ml-2">• {note.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reminders */}
          {taggedItems.reminders.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-yellow-400" />
                Reminders ({taggedItems.reminders.length})
              </h3>
              <div className="space-y-2">
                {taggedItems.reminders.map(reminder => (
                  <div key={reminder.id} className="flex items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${reminder.completed ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className={reminder.completed ? 'line-through text-gray-500' : ''}>{reminder.title}</span>
                    <span className="text-gray-500 text-xs">• {formatDate(reminder.dateTime)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {taggedItems.docs.length > 0 && (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-3">
                <FolderOpen className="w-4 h-4 text-orange-400" />
                Documents ({taggedItems.docs.length})
              </h3>
              <div className="space-y-2">
                {taggedItems.docs.map(doc => (
                  <div key={doc.id} className="text-sm">
                    <span className="font-medium">{doc.title}</span>
                    <span className="text-gray-500 text-xs ml-2">• {doc.fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {taggedItems.tasks.length === 0 && taggedItems.notes.length === 0 && 
           taggedItems.reminders.length === 0 && taggedItems.docs.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-4">No items with this tag yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
