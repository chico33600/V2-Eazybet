import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    const { data: bets, error } = await supabase
      .from('bets')
      .select(`
        *,
        matches (*)
      `)
      .eq('user_id', user.id)
      .in('result', ['WIN', 'LOSE'])
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch bet history' },
        { status: 500 }
      );
    }

    const stats = {
      total: bets?.length || 0,
      wins: bets?.filter(b => b.result === 'WIN').length || 0,
      losses: bets?.filter(b => b.result === 'LOSE').length || 0,
      totalWagered: bets?.reduce((sum, b) => sum + b.amount, 0) || 0,
      totalWon: bets?.filter(b => b.result === 'WIN').reduce((sum, b) => sum + b.gain, 0) || 0,
    };

    return NextResponse.json({
      bets: bets || [],
      stats,
    });

  } catch (error: any) {
    console.error('Bet history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
