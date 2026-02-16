'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Task, Note, Document, Reminder, Tag } from '@/types';
import { Dashboard } from '@/components/Dashboard';
import { TaskManager } from '@/components/TaskManager';
import { NoteManager } from '@/components/NoteManager';
import { DocManager } from '@/components/DocManager';
import { ReminderManager } from '@/components/ReminderManager';
import { TagsManager } from '@/components/TagsManager';
import { LayoutDashboard, Check, FileText, FolderOpen, Bell, Cloud, LogOut, Tag as TagIcon, Database, Menu, X } from 'lucide-react';

type Tab = 'dashboard' | 'tasks' | 'notes' | 'docs' | 'reminders' | 'tags';

export default function SecondBrain() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [docs, setDocs] = useState<Document[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load data from database on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [tasksRes, notesRes, docsRes, tagsRes, remindersRes] = await Promise.all([
          fetch('/api/data?type=tasks'),
          fetch('/api/data?type=notes'),
          fetch('/api/data?type=documents'),
          fetch('/api/data?type=tags'),
          fetch('/api/data?type=reminders'),
        ]);
        
        setTasks(await tasksRes.json());
        setNotes(await notesRes.json());
        setDocs(await docsRes.json());
        setTags(await tagsRes.json());
        setReminders(await remindersRes.json());
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Data change handlers - save to database
  const handleTasksChange = async (newTasks: Task[]) => {
    setTasks(newTasks);
    // Sync to database
    try {
      await fetch('/api/data?type=tasks&action=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTasks),
      });
    } catch (e) {
      console.error('Failed to sync tasks:', e);
    }
  };

  const handleNotesChange = async (newNotes: Note[]) => {
    setNotes(newNotes);
    try {
      await fetch('/api/data?type=notes&action=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNotes),
      });
    } catch (e) {
      console.error('Failed to sync notes:', e);
    }
  };

  const handleDocsChange = async (newDocs: Document[]) => {
    setDocs(newDocs);
    try {
      await fetch('/api/data?type=documents&action=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDocs),
      });
    } catch (e) {
      console.error('Failed to sync docs:', e);
    }
  };

  const handleRemindersChange = async (newReminders: Reminder[]) => {
    setReminders(newReminders);
    try {
      await fetch('/api/data?type=reminders&action=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReminders),
      });
    } catch (e) {
      console.error('Failed to sync reminders:', e);
    }
  };

  const handleTagsChange = async (newTags: Tag[]) => {
    setTags(newTags);
    try {
      await fetch('/api/data?type=tags&action=sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTags),
      });
    } catch (e) {
      console.error('Failed to sync tags:', e);
    }
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as const, label: 'Tasks', icon: Check },
    { id: 'notes' as const, label: 'Notes', icon: FileText },
    { id: 'docs' as const, label: 'Documents', icon: FolderOpen },
    { id: 'reminders' as const, label: 'Reminders', icon: Bell },
    { id: 'tags' as const, label: 'Tags', icon: TagIcon },
  ];

  const handleSync = async () => {
    if (!session?.accessToken) return;
    
    setIsSyncing(true);
    try {
      const data = { tasks, notes, docs, tags, reminders };
      await fetch('/api/drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: session.accessToken, data }),
      });
      setLastSynced(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Sync failed:', error);
    }
    setIsSyncing(false);
  };

  // Loading state
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading from database...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">mnd</h1>
          <p className="text-gray-400 mb-8">Your second brain with SQLite database.</p>
          <button
            onClick={() => signIn("google")}
            className="inline-flex items-center gap-3 px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 transition"
          >
            <Cloud className="w-5 h-5" />
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-2 hover:bg-gray-700 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <h1 className="text-xl font-bold">mnd</h1>
              <span className="hidden sm:flex items-center gap-1 text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full">
                <Database className="w-3 h-3" />
                SQLite
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {lastSynced && (
                <span className="hidden sm:inline text-xs text-gray-500">Synced {lastSynced}</span>
              )}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition disabled:opacity-50"
              >
                <Cloud className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="flex gap-4 sm:gap-6">
          {/* Sidebar - Mobile Drawer */}
          <nav className={`
            fixed lg:relative inset-0 z-20 lg:z-auto w-48 flex-shrink-0 bg-gray-900 lg:bg-transparent p-4 pt-20 lg:p-0 lg:block transition-transform duration-200
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="sticky top-20 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                    activeTab === tab.id
                      ? 'bg-white text-black'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile overlay */}
          {mobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-10 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0 pb-20 lg:pb-0">
            {activeTab === 'dashboard' && (
              <Dashboard tasks={tasks} notes={notes} docs={docs} reminders={reminders} />
            )}
            {activeTab === 'tasks' && (
              <TaskManager tasks={tasks} onTasksChange={handleTasksChange} tags={tags} onTagsChange={handleTagsChange} />
            )}
            {activeTab === 'notes' && (
              <NoteManager notes={notes} onNotesChange={handleNotesChange} tags={tags} onTagsChange={handleTagsChange} />
            )}
            {activeTab === 'docs' && (
              <DocManager docs={docs} tags={tags} onDocsChange={handleDocsChange} onTagsChange={handleTagsChange} />
            )}
            {activeTab === 'reminders' && (
              <ReminderManager reminders={reminders} onRemindersChange={handleRemindersChange} tags={tags} onTagsChange={handleTagsChange} />
            )}
            {activeTab === 'tags' && (
              <TagsManager tags={tags} onTagsChange={handleTagsChange} tasks={tasks} notes={notes} reminders={reminders} docs={docs} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
