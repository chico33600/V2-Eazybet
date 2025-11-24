import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { matchId, scoreHome, scoreAway, status } = await request.json();

    if (!matchId || scoreHome === undefined || scoreAway === undefined) {
      return NextResponse.json(
        { error: 'Match ID and scores are required' },
        { status: 400 }
      );
    }

    const { data: match, error } = await supabase
      .from('matches')
      .update({
        score_home: scoreHome,
        score_away: scoreAway,
        status: status || 'FINISHED',
        updated_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update match score' },
        { status: 500 }
      );
    }

    await supabase
      .from('system_logs')
      .insert({
        type: 'match_score_updated',
        payload: {
          match_id: matchId,
          score_home: scoreHome,
          score_away: scoreAway,
          updated_by: user.id,
        },
      });

    return NextResponse.json({
      message: 'Match score updated successfully',
      match,
    });

  } catch (error: any) {
    console.error('Match score update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
