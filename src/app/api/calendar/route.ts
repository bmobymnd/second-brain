import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();
    
    if (action === 'createEvent') {
      const { title, description, dateTime } = data;
      
      const startTime = new Date(dateTime).toISOString();
      const endTime = new Date(new Date(dateTime).getTime() + 60 * 60 * 1000).toISOString(); // +1 hour
      
      const args = [
        'calendar', 'create', 'primary',
        '--summary', title,
        '--from', startTime,
        '--to', endTime,
      ];
      
      if (description) {
        args.push('--description', description);
      }
      
      const result = execSync(`gog ${args.join(' ')}`, { encoding: 'utf-8' });
      
      // Extract event ID
      const match = result.match(/"id":\s*"([^"]+)"/);
      const eventId = match ? match[1] : null;
      
      return NextResponse.json({ success: true, eventId });
    }
    
    if (action === 'deleteEvent') {
      const { eventId } = data;
      execSync(`gog calendar delete primary ${eventId} --quiet`, { encoding: 'utf-8' });
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
