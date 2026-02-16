'use client';

import { useState } from 'react';
import { Note, Tag } from '@/types';
import { Plus, Trash2, FileText, Tag as TagIcon } from 'lucide-react';

interface NoteManagerProps {
  notes: Note[];
  onNotesChange: (notes: Note[]) => void;
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
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

export function NoteManager({ notes, onNotesChange, tags, onTagsChange }: NoteManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
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

  const addNote = () => {
    if (!newNote.title.trim()) return;
    
    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tagIds: newNote.tagIds,
    };
    
    onNotesChange([note, ...notes]);
    setNewNote({ title: '', content: '', tagIds: [] });
    setShowAddForm(false);
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    onNotesChange(notes.map(n => 
      n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
    ));
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, ...updates, updatedAt: new Date().toISOString() });
    }
  };

  const deleteNote = (id: string) => {
    onNotesChange(notes.filter(n => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Notes
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
            Add Note
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
            placeholder="Note title..."
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400"
            autoFocus
          />
          <textarea
            placeholder="Write your note..."
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 resize-none"
            rows={6}
          />

          {/* Tag selector */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setNewNote({
                      ...newNote,
                      tagIds: newNote.tagIds.includes(tag.id)
                        ? newNote.tagIds.filter(t => t !== tag.id)
                        : [...newNote.tagIds, tag.id]
                    })}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      newNote.tagIds.includes(tag.id) ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ 
                      backgroundColor: newNote.tagIds.includes(tag.id) ? tag.color : tag.color + '30', 
                      color: newNote.tagIds.includes(tag.id) ? 'white' : tag.color,
                      border: `1px solid ${tag.color}`
                    }}
                  >
                    {newNote.tagIds.includes(tag.id) && <Plus className="w-3 h-3 inline mr-1" />}
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={addNote}
            className="w-full px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-200 font-medium"
          >
            Save Note
          </button>
        </div>
      )}

      {/* Notes List */}
      <div className="grid gap-3">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No notes yet. Create one!</p>
        ) : (
          notes.map(note => (
            <div
              key={note.id}
              className="bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-gray-600 transition cursor-pointer"
              onClick={() => setSelectedNote(note)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{note.title}</h3>
                  <p className="text-gray-400 text-xs mt-1 line-clamp-2">{note.content}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-gray-500 text-xs">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                    {note.tagIds.map(tagId => {
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
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                  className="text-gray-500 hover:text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Editor Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => updateNote(selectedNote.id, { title: e.target.value })}
                className="bg-transparent text-lg font-medium text-white focus:outline-none flex-1"
              />
              <button
                onClick={() => setSelectedNote(null)}
                className="text-gray-400 hover:text-white ml-4"
              >
                ✕
              </button>
            </div>
            <textarea
              value={selectedNote.content}
              onChange={(e) => updateNote(selectedNote.id, { content: e.target.value })}
              className="flex-1 p-4 bg-transparent text-white resize-none focus:outline-none"
              placeholder="Write your note..."
            />
            {/* Tag selector in editor */}
            {tags.length > 0 && (
              <div className="p-4 border-t border-gray-700">
                <label className="text-xs text-gray-400 mb-2 block">Tags</label>
                <div className="flex gap-2 flex-wrap">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        const newTagIds = selectedNote.tagIds.includes(tag.id)
                          ? selectedNote.tagIds.filter(t => t !== tag.id)
                          : [...selectedNote.tagIds, tag.id];
                        updateNote(selectedNote.id, { tagIds: newTagIds });
                      }}
                      className={`px-3 py-1 rounded-full text-xs transition ${
                        selectedNote.tagIds.includes(tag.id) ? 'ring-2 ring-white' : ''
                      }`}
                      style={{ 
                        backgroundColor: selectedNote.tagIds.includes(tag.id) ? tag.color : tag.color + '30', 
                        color: selectedNote.tagIds.includes(tag.id) ? 'white' : tag.color,
                        border: `1px solid ${tag.color}`
                      }}
                    >
                      {selectedNote.tagIds.includes(tag.id) && <Plus className="w-3 h-3 inline mr-1" />}
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
