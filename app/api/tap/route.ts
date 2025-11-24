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

    const { data: canTap } = await supabase
      .rpc('check_tap_rate_limit', { p_user_id: user.id });

    if (!canTap) {
      return NextResponse.json(
        { error: 'Tap limit reached. Maximum 10 taps per hour.' },
        { status: 429 }
      );
    }

    const tokensEarned = 5;

    await supabase
      .from('tap_events')
      .insert({
        user_id: user.id,
        earned: tokensEarned,
      });

    const { data: currentWallet } = await supabase
      .from('wallet')
      .select('tokens, total_earned_tokens')
      .eq('user_id', user.id)
      .single();

    if (!currentWallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from('wallet')
      .update({
        tokens: currentWallet.tokens + tokensEarned,
        total_earned_tokens: currentWallet.total_earned_tokens + tokensEarned,
      })
      .eq('user_id', user.id);

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update wallet' },
        { status: 500 }
      );
    }

    const { data: wallet } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user.id)
      .single();

    await supabase
      .from('system_logs')
      .insert({
        type: 'tap_event',
        payload: {
          user_id: user.id,
          earned: tokensEarned,
        },
      });

    return NextResponse.json({
      message: 'Tap successful',
      earned: tokensEarned,
      wallet,
    });

  } catch (error: any) {
    console.error('Tap error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const { data: taps, error } = await supabase
      .from('tap_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString())
      .order('created_at', { ascending: false });

    const { data: canTap } = await supabase
      .rpc('check_tap_rate_limit', { p_user_id: user.id });

    return NextResponse.json({
      taps: taps || [],
      canTap,
      remaining: canTap ? 10 - (taps?.length || 0) : 0,
    });

  } catch (error: any) {
    console.error('Tap today error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
