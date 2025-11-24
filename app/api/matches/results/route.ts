import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    const { data: matches, error } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'FINISHED')
      .order('start_time', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch match results' },
        { status: 500 }
      );
    }

    return NextResponse.json({ matches: matches || [] });

  } catch (error: any) {
    console.error('Match results fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
