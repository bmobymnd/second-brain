import { NextResponse } from 'next/server';
import db, { getAll, getById, insert, update, remove } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // tasks, notes, documents, reminders, tags
  const id = searchParams.get('id');

  if (!type) {
    return NextResponse.json({ error: 'Missing type parameter' }, { status: 400 });
  }

  // Map plural to singular table names
  const tableMap: Record<string, string> = {
    tasks: 'tasks',
    notes: 'notes',
    documents: 'documents',
    reminders: 'reminders',
    tags: 'tags',
  };

  const table = tableMap[type];
  if (!table) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    if (id) {
      const item = getById(table, id);
      return NextResponse.json(item);
    }
    const items = getAll(table);
    return NextResponse.json(items);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const action = searchParams.get('action');

  const tableMap: Record<string, string> = {
    tasks: 'tasks',
    notes: 'notes',
    documents: 'documents',
    reminders: 'reminders',
    tags: 'tags',
  };

  const table = tableMap[type || ''];
  if (!table) {
    return NextResponse.json({ error: 'Missing or invalid type parameter' }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Sync action - replace all items
    if (action === 'sync') {
      // Clear table and re-insert all items
      db.exec(`DELETE FROM ${table}`);
      
      if (Array.isArray(body)) {
        for (const item of body) {
          // Handle SQLite boolean conversion
          if (item.completed !== undefined) {
            item.completed = item.completed ? 1 : 0;
          }
          insert(table, item);
        }
      }
      return NextResponse.json({ success: true });
    }

    // CRUD actions
    if (action === 'create') {
      if (body.completed !== undefined) {
        body.completed = body.completed ? 1 : 0;
      }
      insert(table, body);
      return NextResponse.json({ success: true });
    }

    if (action === 'update' && body.id) {
      if (body.completed !== undefined) {
        body.completed = body.completed ? 1 : 0;
      }
      update(table, body.id, body);
      return NextResponse.json({ success: true });
    }

    if (action === 'delete' && body.id) {
      remove(table, body.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
