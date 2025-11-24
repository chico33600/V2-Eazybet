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

    const { matchId, choice, amount } = await request.json();

    if (!matchId || !choice || !amount) {
      return NextResponse.json(
        { error: 'Match ID, choice, and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    if (!['HOME', 'DRAW', 'AWAY'].includes(choice)) {
      return NextResponse.json(
        { error: 'Invalid choice' },
        { status: 400 }
      );
    }

    const { data: wallet } = await supabase
      .from('wallet')
      .select('tokens')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.tokens < amount) {
      return NextResponse.json(
        { error: 'Insufficient tokens' },
        { status: 400 }
      );
    }

    const { data: match } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single();

    if (!match) {
      return NextResponse.json(
        { error: 'Match not found' },
        { status: 404 }
      );
    }

    if (match.status !== 'UPCOMING') {
      return NextResponse.json(
        { error: 'Match is not available for betting' },
        { status: 400 }
      );
    }

    const { error: walletError } = await supabase
      .from('wallet')
      .update({
        tokens: wallet.tokens - amount,
      })
      .eq('user_id', user.id);

    if (walletError) {
      return NextResponse.json(
        { error: 'Failed to deduct tokens' },
        { status: 500 }
      );
    }

    const { data: bet, error: betError } = await supabase
      .from('bets')
      .insert({
        user_id: user.id,
        match_id: matchId,
        choice,
        amount,
        result: 'PENDING',
        gain: 0,
      })
      .select()
      .single();

    if (betError) {
      await supabase
        .from('wallet')
        .update({
          tokens: wallet.tokens,
        })
        .eq('user_id', user.id);

      return NextResponse.json(
        { error: 'Failed to place bet' },
        { status: 500 }
      );
    }

    await supabase
      .from('system_logs')
      .insert({
        type: 'bet_placed',
        payload: {
          bet_id: bet.id,
          user_id: user.id,
          match_id: matchId,
          choice,
          amount,
        },
      });

    const { data: updatedWallet } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      message: 'Bet placed successfully',
      bet,
      wallet: updatedWallet,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Bet placement error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
