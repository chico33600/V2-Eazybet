import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .in('status', ['UPCOMING', 'LIVE'])
      .order('start_time', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch matches' },
        { status: 500 }
      );
    }

    return NextResponse.json({ matches: matches || [] });

  } catch (error: any) {
    console.error('Matches fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
