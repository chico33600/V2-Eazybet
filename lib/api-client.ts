import { supabase } from './supabase-client';
import type { Match, Bet } from './supabase-client';

export async function fetchMatches(status?: string): Promise<Match[]> {
  let query = supabase
    .from('matches')
    .select('*')
    .order('match_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

export async function placeBet(matchId: string, amount: number, choice: 'A' | 'Draw' | 'B') {
  if (amount < 10) {
    throw new Error('Mise minimum : 10 jetons');
  }

  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .maybeSingle();

  if (!match) {
    throw new Error('Match non trouvé');
  }

  if (match.status !== 'upcoming') {
    throw new Error('Ce match n\'est plus disponible pour les paris');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tokens, total_bets')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || profile.tokens < amount) {
    throw new Error('Jetons insuffisants');
  }

  const odds = choice === 'A' ? match.odds_a : choice === 'Draw' ? match.odds_draw : match.odds_b;
  const totalWin = Math.round(amount * odds);
  const profit = totalWin - amount;
  const diamondsFromProfit = Math.round(profit * 0.01);

  await supabase
    .from('profiles')
    .update({
      tokens: profile.tokens - amount,
      total_bets: profile.total_bets + 1
    })
    .eq('id', user.id);

  const { data: bet, error } = await supabase
    .from('bets')
    .insert({
      user_id: user.id,
      match_id: matchId,
      amount,
      choice,
      odds,
      potential_win: totalWin,
      potential_diamonds: diamondsFromProfit,
    })
    .select()
    .single();

  if (error) {
    await supabase
      .from('profiles')
      .update({
        tokens: profile.tokens,
        total_bets: profile.total_bets
      })
      .eq('id', user.id);
    throw new Error('Erreur lors du pari');
  }

  return bet;
}

export async function getUserBets(status?: 'active' | 'history'): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from('bets')
    .select(`
      *,
      matches:match_id (
        id,
        team_a,
        team_b,
        league,
        status,
        result,
        match_date
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (status === 'active') {
    query = query.is('is_win', null);
  } else if (status === 'history') {
    query = query.not('is_win', 'is', null);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching bets:', error);
    return [];
  }

  return data || [];
}

export async function earnTokens(taps: number = 1) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  console.log(`[earnTokens] Called with ${taps} taps`);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: todayTaps } = await supabase
    .from('tap_earnings')
    .select('tokens_earned')
    .eq('user_id', user.id)
    .gte('created_at', today.toISOString());

  const totalTapsToday = todayTaps?.reduce((sum, tap) => sum + tap.tokens_earned, 0) || 0;
  const totalTapsCountToday = totalTapsToday;

  if (totalTapsCountToday >= 100) {
    throw new Error('Limite quotidienne atteinte');
  }

  const remainingTaps = 100 - totalTapsCountToday;
  const actualTaps = Math.min(taps, remainingTaps);
  const tokensEarned = actualTaps * 1;

  console.log(`[earnTokens] Tokens to earn: ${tokensEarned}`);

  const { data: newBalance, error: updateError } = await supabase
    .rpc('increment_tokens', {
      p_user_id: user.id,
      p_amount: tokensEarned
    });

  if (updateError) {
    console.error('[earnTokens] RPC error:', updateError);
    throw new Error('Erreur lors de la mise à jour des jetons');
  }

  console.log(`[earnTokens] Tokens incremented by ${tokensEarned}, new balance: ${newBalance}`);

  await supabase
    .from('tap_earnings')
    .insert({
      user_id: user.id,
      tokens_earned: tokensEarned,
    });

  console.log(`[earnTokens] Successfully updated tokens to ${newBalance}`);

  return {
    tokens_earned: tokensEarned,
    new_balance: newBalance,
    remaining_taps: remainingTaps - actualTaps,
  };
}

export async function getLeaderboard(limit: number = 100, offset: number = 0) {
  const { data: players, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, diamonds, total_bets, won_bets')
    .order('diamonds', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return (players || []).map((player, index) => ({
    rank: offset + index + 1,
    ...player,
    win_rate: player.total_bets > 0
      ? Math.round((player.won_bets / player.total_bets) * 100)
      : 0,
  }));
}
