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

    const {
      teamHome,
      teamAway,
      teamHomeImage,
      teamAwayImage,
      competition,
      oddHome,
      oddDraw,
      oddAway,
      startTime,
    } = await request.json();

    if (!teamHome || !teamAway || !oddHome || !oddDraw || !oddAway || !startTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: match, error } = await supabase
      .from('matches')
      .insert({
        team_home: teamHome,
        team_away: teamAway,
        team_home_image: teamHomeImage || '',
        team_away_image: teamAwayImage || '',
        competition: competition || '',
        odd_home: parseFloat(oddHome),
        odd_draw: parseFloat(oddDraw),
        odd_away: parseFloat(oddAway),
        start_time: startTime,
        status: 'UPCOMING',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create match' },
        { status: 500 }
      );
    }

    await supabase
      .from('system_logs')
      .insert({
        type: 'match_created',
        payload: {
          match_id: match.id,
          created_by: user.id,
        },
      });

    return NextResponse.json({
      message: 'Match created successfully',
      match,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Match creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
