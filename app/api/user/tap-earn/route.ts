import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

const TOKENS_PER_TAP = 1;
const MAX_TAPS_PER_DAY = 100;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const supabase = createClient();
    const body = await request.json();
    const { taps = 1 } = body;

    if (taps < 1 || taps > 10) {
      return createErrorResponse('Invalid number of taps (must be 1-10)', 400);
    }

    // Check daily tap limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayTaps, error: tapsError } = await supabase
      .from('tap_events')
      .select('tokens_earned')
      .eq('user_id', user!.id)
      .gte('created_at', today.toISOString());

    if (tapsError) {
      console.error('Tap events fetch error:', tapsError);
      return createErrorResponse('Failed to check tap limit', 500);
    }

    const totalTapsToday = todayTaps?.reduce((sum, tap) => sum + tap.tokens_earned, 0) || 0;

    if (totalTapsToday >= MAX_TAPS_PER_DAY) {
      return createErrorResponse('Daily tap limit reached. Come back tomorrow!', 429);
    }

    const remainingTaps = MAX_TAPS_PER_DAY - totalTapsToday;
    const actualTaps = Math.min(taps, remainingTaps);
    const tokensEarned = actualTaps * TOKENS_PER_TAP;

    // Get current wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallet')
      .select('tokens, diamonds')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (walletError || !wallet) {
      return createErrorResponse('Wallet not found', 404);
    }

    // Update tokens
    const newBalance = wallet.tokens + tokensEarned;
    const { error: updateError } = await supabase
      .from('wallet')
      .update({ tokens: newBalance })
      .eq('user_id', user!.id);

    if (updateError) {
      console.error('Token update error:', updateError);
      return createErrorResponse('Failed to update tokens', 500);
    }

    // Record tap event
    const { error: recordError } = await supabase
      .from('tap_events')
      .insert({
        user_id: user!.id,
        tokens_earned: tokensEarned,
      });

    if (recordError) {
      console.error('Tap record error:', recordError);
    }

    return createSuccessResponse({
      message: 'Tokens earned!',
      tokens_earned: tokensEarned,
      new_balance: newBalance,
      diamonds: wallet.diamonds,
      taps_used: actualTaps,
      remaining_taps: remainingTaps - actualTaps,
    });

  } catch (error: any) {
    console.error('Tap-to-earn error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const supabase = createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: todayTaps, error } = await supabase
      .from('tap_events')
      .select('tokens_earned')
      .eq('user_id', user!.id)
      .gte('created_at', today.toISOString());

    if (error) {
      console.error('Tap events fetch error:', error);
      return createErrorResponse('Failed to fetch tap stats', 500);
    }

    const totalTapsToday = todayTaps?.reduce((sum, tap) => sum + tap.tokens_earned, 0) || 0;

    return createSuccessResponse({
      taps_used: totalTapsToday,
      taps_remaining: MAX_TAPS_PER_DAY - totalTapsToday,
      max_taps: MAX_TAPS_PER_DAY,
      tokens_per_tap: TOKENS_PER_TAP,
      total_tokens_earned_today: totalTapsToday,
    });

  } catch (error: any) {
    console.error('Tap stats error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
