'use client';

import { Task, Note, Document, Reminder, DashboardStats } from '@/types';
import { CheckCircle, Clock, FileText, Briefcase, TrendingUp, Heart, BookOpen, Palette, Bell } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';

interface DashboardProps {
  tasks: Task[];
  notes: Note[];
  docs: Document[];
  reminders: Reminder[];
}

export function Dashboard({ tasks, notes, docs, reminders }: DashboardProps) {
  const stats: DashboardStats = {
    tasksCompleted: tasks.filter(t => t.status === 'done').length,
    tasksPending: tasks.filter(t => t.status !== 'done').length,
    notesCount: notes.length,
    docsCount: docs.length,
  };

  const upcomingReminders = reminders.filter(r => !r.completed && !isPast(parseISO(r.dateTime))).length;
  const overdueReminders = reminders.filter(r => !r.completed && isPast(parseISO(r.dateTime))).length;

  const categoryBreakdown = tasks.reduce((acc, task) => {
    if (task.status !== 'done') {
      acc[task.category] = (acc[task.category] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const categoryIcons: Record<string, React.ReactNode> = {
    business: <Briefcase className="w-4 h-4" />,
    cert: <BookOpen className="w-4 h-4" />,
    health: <Heart className="w-4 h-4" />,
    spanish: <TrendingUp className="w-4 h-4" />,
    trading: <TrendingUp className="w-4 h-4" />,
    creative: <Palette className="w-4 h-4" />,
    other: <Clock className="w-4 h-4" />,
  };

  const categoryLabels: Record<string, string> = {
    business: 'Business',
    cert: 'Cert Study',
    health: 'Health',
    spanish: 'Spanish',
    trading: 'Trading',
    creative: 'Creative',
    other: 'Other',
  };

  const recentNotes = notes.slice(0, 3);
  const recentDocs = docs.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.tasksCompleted}</p>
              <p className="text-xs text-gray-400">Completed</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.tasksPending}</p>
              <p className="text-xs text-gray-400">Pending</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-900/50 rounded-lg">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.notesCount}</p>
              <p className="text-xs text-gray-400">Notes</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-900/50 rounded-lg">
              <Briefcase className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.docsCount}</p>
              <p className="text-xs text-gray-400">Documents</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${overdueReminders > 0 ? 'bg-red-900/50' : 'bg-yellow-900/50'}`}>
              <Bell className={`w-5 h-5 ${overdueReminders > 0 ? 'text-red-400' : 'text-yellow-400'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">{upcomingReminders}</p>
              <p className="text-xs text-gray-400">Reminders</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {Object.keys(categoryBreakdown).length > 0 && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Tasks by Category</h3>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(categoryBreakdown).map(([cat, count]) => (
              <span key={cat} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 rounded-full text-sm">
                {categoryIcons[cat]}
                <span>{categoryLabels[cat] || cat}</span>
                <span className="font-medium">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Recent Notes */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Recent Notes
          </h3>
          {recentNotes.length === 0 ? (
            <p className="text-gray-500 text-sm">No notes yet</p>
          ) : (
            <div className="space-y-2">
              {recentNotes.map(note => (
                <div key={note.id} className="text-sm">
                  <span className="font-medium">{note.title}</span>
                  <span className="text-gray-500 text-xs ml-2">{note.category}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Documents */}
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Recent Documents
          </h3>
          {recentDocs.length === 0 ? (
            <p className="text-gray-500 text-sm">No documents yet</p>
          ) : (
            <div className="space-y-2">
              {recentDocs.map(doc => (
                <div key={doc.id} className="text-sm">
                  <span className="font-medium">{doc.title}</span>
                  <span className="text-gray-500 text-xs ml-2">{doc.fileName}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
