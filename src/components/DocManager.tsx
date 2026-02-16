'use client';

import { useState, useRef } from 'react';
import { Document, Tag } from '@/types';
import { Plus, Trash2, FolderOpen, File, Upload, Tag as TagIcon, X, Check, Download } from 'lucide-react';

interface DocManagerProps {
  docs: Document[];
  tags: Tag[];
  onDocsChange: (docs: Document[]) => void;
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

const fileTypeIcons: Record<string, string> = {
  'application/pdf': '📄',
  'image/jpeg': '🖼️',
  'image/png': '🖼️',
  'image/gif': '🖼️',
  'application/zip': '📦',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
};

export function DocManager({ docs, tags, onDocsChange, onTagsChange }: DocManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  
  // Tag creation in modal
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6');
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docTitle, setDocTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setShowNewTagForm(false);
  };

  const deleteTag = (id: string) => {
    onTagsChange(tags.filter(t => t.id !== id));
    setSelectedTags(selectedTags.filter(t => t !== id));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!docTitle) {
        setDocTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile || !docTitle.trim()) return;

    const reader = new FileReader();
    reader.onload = () => {
      const doc: Document = {
        id: Date.now().toString(),
        title: docTitle,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        fileUrl: reader.result as string,
        tagIds: selectedTags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onDocsChange([doc, ...docs]);
      setSelectedFile(null);
      setDocTitle('');
      setSelectedTags([]);
      setShowAddForm(false);
    };
    reader.readAsDataURL(selectedFile);
  };

  const deleteDoc = (id: string) => {
    onDocsChange(docs.filter(d => d.id !== id));
  };

  const downloadDoc = (doc: Document) => {
    const link = document.createElement('a');
    link.href = doc.fileUrl!;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and sort documents
  let filteredDocs = filterTag 
    ? docs.filter(d => d.tagIds.includes(filterTag))
    : docs;

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === 'name') {
      return a.title.localeCompare(b.title);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <FolderOpen className="w-5 h-5" />
          Documents
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
            Upload
          </button>
        </div>
      </div>

      {/* Tag Manager */}
      {showTagManager && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Manage Tags</h3>
            <button onClick={() => setShowTagManager(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
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
              onClick={addTag}
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
                <button onClick={() => deleteTag(tag.id)} className="hover:opacity-70">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {tags.length === 0 && <span className="text-gray-500 text-sm">No tags yet</span>}
          </div>
        </div>
      )}

      {/* Filters & Sort */}
      <div className="flex items-center gap-4 flex-wrap">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
          className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white"
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
        </select>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterTag(null)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filterTag === null ? 'bg-white text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          {tags.map(tag => (
            <button
              key={tag.id}
              onClick={() => setFilterTag(filterTag === tag.id ? null : tag.id)}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                filterTag === tag.id ? 'ring-2 ring-white' : ''
              }`}
              style={{ 
                backgroundColor: filterTag === tag.id ? tag.color : tag.color + '30', 
                color: filterTag === tag.id ? 'white' : tag.color,
                border: `1px solid ${tag.color}`
              }}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Upload Document</h3>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!selectedFile ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-8 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition flex flex-col items-center gap-2"
            >
              <Upload className="w-8 h-8" />
              Click to select a file
            </button>
          ) : (
            <div className="bg-gray-700 p-3 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{fileTypeIcons[selectedFile.type] || '📄'}</span>
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <button onClick={() => setSelectedFile(null)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input
            type="text"
            placeholder="Document title..."
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400"
          />

          {/* Tag selection */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setSelectedTags(
                      selectedTags.includes(tag.id)
                        ? selectedTags.filter(t => t !== tag.id)
                        : [...selectedTags, tag.id]
                    )}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      selectedTags.includes(tag.id)
                        ? 'ring-2 ring-white'
                        : ''
                    }`}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : tag.color + '30', 
                      color: selectedTags.includes(tag.id) ? 'white' : tag.color,
                      border: `1px solid ${tag.color}`
                    }}
                  >
                    {selectedTags.includes(tag.id) && <Check className="w-3 h-3 inline mr-1" />}
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Create new tag inline */}
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowNewTagForm(!showNewTagForm)}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              + Create new tag
            </button>
          </div>

          {showNewTagForm && (
            <div className="flex gap-2 items-center bg-gray-700 p-2 rounded-lg">
              <input
                type="text"
                placeholder="Tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className="flex-1 px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm text-white placeholder-gray-400"
              />
              <div className="flex gap-1">
                {tagColors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setNewTagColor(color.value)}
                    className={`w-5 h-5 rounded-full transition ${newTagColor === color.value ? 'ring-2 ring-white' : ''}`}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
              <button
                onClick={addTag}
                className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || !docTitle.trim()}
            className="w-full px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Document
          </button>
        </div>
      )}

      {/* Documents List */}
      {sortedDocs.length === 0 && !showAddForm ? (
        <p className="text-gray-500 text-sm py-8 text-center">
          {filterTag ? 'No documents with this tag' : 'No documents yet. Upload one!'}
        </p>
      ) : (
        <div className="space-y-2">
          {sortedDocs.map(doc => (
            <div
              key={doc.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition group"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{fileTypeIcons[doc.fileType] || '📄'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadDoc(doc)}
                      className="font-medium text-sm hover:text-blue-400 text-left"
                    >
                      {doc.title}
                    </button>
                    <button
                      onClick={() => downloadDoc(doc)}
                      className="text-gray-400 hover:text-blue-400"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {doc.fileName} • {formatFileSize(doc.fileSize)} • {formatDate(doc.createdAt)}
                  </p>
                  {doc.tagIds.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {doc.tagIds.map(tagId => {
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
                  )}
                </div>
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="text-gray-500 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
