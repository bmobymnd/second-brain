'use client';

import { useState } from 'react';
import { Reminder, Tag } from '@/types';
import { Plus, Trash2, Bell, Clock, Repeat, Calendar, Tag as TagIcon } from 'lucide-react';
import { format, isPast, isToday, isTomorrow, parseISO } from 'date-fns';

interface ReminderManagerProps {
  reminders: Reminder[];
  onRemindersChange: (reminders: Reminder[]) => void;
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

export function ReminderManager({ reminders, onRemindersChange, tags, onTagsChange }: ReminderManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTagManager, setShowTagManager] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  const [newReminder, setNewReminder] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    time: '', 
    repeat: 'none' as Reminder['repeat'],
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

  const createCalendarEvent = async (reminder: Reminder): Promise<string | null> => {
    try {
      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createEvent',
          data: {
            title: reminder.title,
            description: reminder.description,
            dateTime: reminder.dateTime,
          },
        }),
      });
      
      const result = await response.json();
      return result.eventId || null;
    } catch (error) {
      console.error('Failed to create calendar event:', error);
      return null;
    }
  };

  const deleteCalendarEvent = async (eventId: string) => {
    try {
      await fetch('/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deleteEvent',
          data: { eventId },
        }),
      });
    } catch (error) {
      console.error('Failed to delete calendar event:', error);
    }
  };

  const addReminder = async () => {
    if (!newReminder.title.trim() || !newReminder.date || !newReminder.time) return;
    
    const dateTime = new Date(`${newReminder.date}T${newReminder.time}`).toISOString();
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      title: newReminder.title,
      description: newReminder.description,
      dateTime,
      repeat: newReminder.repeat,
      completed: false,
      tagIds: newReminder.tagIds,
      createdAt: new Date().toISOString(),
    };
    
    // Create calendar event
    setSyncing(true);
    const calendarEventId = await createCalendarEvent(reminder);
    setSyncing(false);
    
    const finalReminder = { ...reminder, calendarEventId: calendarEventId || undefined };
    onRemindersChange([finalReminder, ...reminders]);
    setNewReminder({ title: '', description: '', date: '', time: '', repeat: 'none', tagIds: [] });
    setShowAddForm(false);
  };

  const toggleReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    // If completing (not un-completing), delete the calendar event
    if (!reminder.completed && reminder.calendarEventId) {
      setSyncing(true);
      await deleteCalendarEvent(reminder.calendarEventId);
      setSyncing(false);
    }
    
    onRemindersChange(reminders.map(r => 
      r.id === id ? { ...r, completed: !r.completed } : r
    ));
  };

  const deleteReminder = async (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    
    // Delete calendar event if exists
    if (reminder?.calendarEventId) {
      setSyncing(true);
      await deleteCalendarEvent(reminder.calendarEventId);
      setSyncing(false);
    }
    
    onRemindersChange(reminders.filter(r => r.id !== id));
  };

  const formatReminderDate = (dateTime: string) => {
    const date = parseISO(dateTime);
    if (isToday(date)) return `Today at ${format(date, 'h:mm a')}`;
    if (isTomorrow(date)) return `Tomorrow at ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, h:mm a');
  };

  const isOverdue = (dateTime: string) => isPast(parseISO(dateTime));

  const upcomingReminders = reminders.filter(r => !r.completed);
  const pastReminders = reminders.filter(r => r.completed);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Reminders
          {syncing && <span className="text-xs text-gray-400 animate-pulse">(syncing...)</span>}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowTagManager(!showTagManager)}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 text-gray-300 rounded-lg text-sm hover:bg-gray-600 transition"
          >
            <Plus className="w-4 h-4" />
            Tags
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-white text-black rounded-lg text-sm hover:bg-gray-200 transition"
          >
            <Plus className="w-4 h-4" />
            Add Reminder
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
            placeholder="Reminder title..."
            value={newReminder.title}
            onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400"
            autoFocus
          />
          <input
            type="text"
            placeholder="Description (optional)..."
            value={newReminder.description}
            onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400"
          />
          <div className="flex gap-3 flex-wrap">
            <input
              type="date"
              value={newReminder.date}
              onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            />
            <input
              type="time"
              value={newReminder.time}
              onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            />
            <select
              value={newReminder.repeat}
              onChange={(e) => setNewReminder({ ...newReminder, repeat: e.target.value as Reminder['repeat'] })}
              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white"
            >
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Tag selector */}
          {tags.length > 0 && (
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Tags</label>
              <div className="flex gap-2 flex-wrap">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => setNewReminder({
                      ...newReminder,
                      tagIds: newReminder.tagIds.includes(tag.id)
                        ? newReminder.tagIds.filter(t => t !== tag.id)
                        : [...newReminder.tagIds, tag.id]
                    })}
                    className={`px-3 py-1 rounded-full text-xs transition ${
                      newReminder.tagIds.includes(tag.id) ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ 
                      backgroundColor: newReminder.tagIds.includes(tag.id) ? tag.color : tag.color + '30', 
                      color: newReminder.tagIds.includes(tag.id) ? 'white' : tag.color,
                      border: `1px solid ${tag.color}`
                    }}
                  >
                    {newReminder.tagIds.includes(tag.id) && <Plus className="w-3 h-3 inline mr-1" />}
                    {tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>Will sync to Google Calendar</span>
          </div>

          <button
            onClick={addReminder}
            disabled={syncing}
            className="w-full px-4 py-2 bg-white text-black rounded-lg text-sm hover:bg-gray-200 font-medium disabled:opacity-50"
          >
            {syncing ? 'Creating...' : 'Set Reminder'}
          </button>
        </div>
      )}

      {/* Upcoming Reminders */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Upcoming ({upcomingReminders.length})
        </h3>
        {upcomingReminders.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">No upcoming reminders</p>
        ) : (
          <div className="space-y-2">
            {upcomingReminders.map(reminder => {
              const overdue = isOverdue(reminder.dateTime);
              return (
                <div
                  key={reminder.id}
                  className={`bg-gray-800 p-3 rounded-lg border-l-4 shadow-sm flex items-start gap-3 ${
                    overdue ? 'border-l-red-500' : 'border-l-blue-500'
                  }`}
                >
                  <button
                    onClick={() => toggleReminder(reminder.id)}
                    className="mt-0.5 w-5 h-5 border-2 border-gray-500 rounded-full hover:border-green-500 hover:bg-green-500/20 transition flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-sm ${overdue ? 'text-red-400' : 'text-white'}`}>
                        {reminder.title}
                      </span>
                      {overdue && <span className="text-xs text-red-400">Overdue</span>}
                      {reminder.repeat !== 'none' && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Repeat className="w-3 h-3" />
                          {reminder.repeat}
                        </span>
                      )}
                      {reminder.calendarEventId && (
                        <span className="text-xs text-green-400 flex items-center gap-1" title="Synced to Google Calendar">
                          <Calendar className="w-3 h-3" />
                        </span>
                      )}
                      {reminder.tagIds.map(tagId => {
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
                    {reminder.description && (
                      <p className="text-gray-400 text-sm mt-1">{reminder.description}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">{formatReminderDate(reminder.dateTime)}</p>
                  </div>
                  <button
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-gray-500 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Past/Completed Reminders */}
      {pastReminders.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Completed ({pastReminders.length})
          </h3>
          <div className="space-y-1">
            {pastReminders.map(reminder => (
              <div
                key={reminder.id}
                className="bg-gray-800/50 p-2 rounded-lg flex items-center gap-3 opacity-50"
              >
                <button
                  onClick={() => toggleReminder(reminder.id)}
                  className="mt-0.5 w-5 h-5 bg-green-500 border-green-500 rounded-full flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-white text-xs">✓</span>
                </button>
                <span className="text-sm text-gray-400 line-through">{reminder.title}</span>
                <button
                  onClick={() => deleteReminder(reminder.id)}
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
