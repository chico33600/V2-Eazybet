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

export async function fetchAvailableMatches(mode?: 'fictif' | 'real'): Promise<Match[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let query = supabase
    .from('matches')
    .select('*')
    .eq('status', 'upcoming')
    .gt('match_date', now.toISOString())
    .lte('match_date', sevenDaysFromNow.toISOString())
    .order('match_date', { ascending: true });

  if (mode) {
    query = query.eq('match_mode', mode);
  }

  const { data: matches, error } = await query;

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  const { data: userBets } = await supabase
    .from('bets')
    .select('match_id')
    .eq('user_id', user.id)
    .is('is_win', null);

  const { data: comboBets } = await supabase
    .from('combo_bets')
    .select('combo_bet_selections(match_id)')
    .eq('user_id', user.id)
    .is('is_win', null);

  const bettedMatchIds = new Set<string>();

  if (userBets) {
    userBets.forEach(bet => bettedMatchIds.add(bet.match_id));
  }

  if (comboBets) {
    comboBets.forEach(combo => {
      if (combo.combo_bet_selections) {
        combo.combo_bet_selections.forEach((sel: any) => {
          bettedMatchIds.add(sel.match_id);
        });
      }
    });
  }

  return (matches || []).filter(match => !bettedMatchIds.has(match.id));
}

export async function placeBet(matchId: string, amount: number, choice: 'A' | 'Draw' | 'B', currency: 'tokens' | 'diamonds' = 'tokens') {
  console.log('[placeBet] Starting with:', { matchId, amount, choice, currency });

  const minAmount = currency === 'tokens' ? 10 : 1;
  if (amount < minAmount) {
    throw new Error(`Mise minimum : ${minAmount}`);
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
    .select('tokens, diamonds, total_bets')
    .eq('id', user.id)
    .maybeSingle();

  console.log('[placeBet] Profile:', profile);

  if (!profile) {
    throw new Error('Profil non trouvé');
  }

  if (currency === 'tokens' && profile.tokens < amount) {
    throw new Error('Jetons insuffisants');
  }

  if (currency === 'diamonds' && profile.diamonds < amount) {
    throw new Error('Diamants insuffisants');
  }

  const odds = choice === 'A' ? match.odds_a : choice === 'Draw' ? match.odds_draw : match.odds_b;
  const totalWin = Math.round(amount * odds);
  const profit = totalWin - amount;
  const diamondsFromProfit = currency === 'tokens' ? Math.round(profit * 0.01) : 0;

  const updateData: any = {
    total_bets: profile.total_bets + 1
  };

  if (currency === 'tokens') {
    updateData.tokens = profile.tokens - amount;
  } else {
    updateData.diamonds = profile.diamonds - amount;
  }

  await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  console.log('[placeBet] Inserting bet with data:', {
    user_id: user.id,
    match_id: matchId,
    amount,
    choice,
    odds,
    potential_win: totalWin,
    potential_diamonds: diamondsFromProfit,
    bet_currency: currency,
  });

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
      bet_currency: currency,
    })
    .select()
    .single();

  if (error) {
    console.error('[placeBet] Insert error:', error);
    const rollbackData: any = {
      total_bets: profile.total_bets
    };
    if (currency === 'tokens') {
      rollbackData.tokens = profile.tokens;
    } else {
      rollbackData.diamonds = profile.diamonds;
    }
    await supabase
      .from('profiles')
      .update(rollbackData)
      .eq('id', user.id);
    throw new Error(`Erreur lors du pari: ${error.message}`);
  }

  console.log('[placeBet] Bet placed successfully:', bet);

  return bet;
}

export async function placeCombobet(
  selections: Array<{ matchId: string; choice: 'A' | 'Draw' | 'B'; odds: number }>,
  amount: number,
  currency: 'tokens' | 'diamonds' = 'tokens'
) {
  const minAmount = currency === 'tokens' ? 10 : 1;
  if (amount < minAmount) {
    throw new Error(`Mise minimum : ${minAmount}`);
  }

  if (selections.length < 2) {
    throw new Error('Un pari combiné nécessite au moins 2 sélections');
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Non authentifié');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tokens, diamonds, total_bets')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile) {
    throw new Error('Profil non trouvé');
  }

  if (currency === 'tokens' && profile.tokens < amount) {
    throw new Error('Jetons insuffisants');
  }

  if (currency === 'diamonds' && profile.diamonds < amount) {
    throw new Error('Diamants insuffisants');
  }

  const matchIds = selections.map(s => s.matchId);
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, status')
    .in('id', matchIds);

  if (matchesError || !matches || matches.length !== selections.length) {
    throw new Error('Un ou plusieurs matchs sont introuvables');
  }

  const unavailableMatch = matches.find(m => m.status !== 'upcoming');
  if (unavailableMatch) {
    throw new Error('Un ou plusieurs matchs ne sont plus disponibles pour les paris');
  }

  const totalOdds = selections.reduce((acc, sel) => acc * sel.odds, 1);
  const totalWin = Math.round(amount * totalOdds);
  const profit = totalWin - amount;
  const diamondsFromProfit = currency === 'tokens' ? Math.round(profit * 0.01) : 0;

  const updateData: any = {
    total_bets: profile.total_bets + 1
  };

  if (currency === 'tokens') {
    updateData.tokens = profile.tokens - amount;
  } else {
    updateData.diamonds = profile.diamonds - amount;
  }

  await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id);

  const { data: comboBet, error: comboBetError } = await supabase
    .from('combo_bets')
    .insert({
      user_id: user.id,
      amount,
      bet_currency: currency,
      total_odds: totalOdds,
      potential_win: totalWin,
      potential_diamonds: diamondsFromProfit,
    })
    .select()
    .single();

  if (comboBetError) {
    const rollbackData: any = {
      total_bets: profile.total_bets
    };
    if (currency === 'tokens') {
      rollbackData.tokens = profile.tokens;
    } else {
      rollbackData.diamonds = profile.diamonds;
    }
    await supabase
      .from('profiles')
      .update(rollbackData)
      .eq('id', user.id);
    throw new Error('Erreur lors du pari combiné');
  }

  const selectionsToInsert = selections.map(sel => ({
    combo_bet_id: comboBet.id,
    match_id: sel.matchId,
    choice: sel.choice,
    odds: sel.odds,
  }));

  const { error: selectionsError } = await supabase
    .from('combo_bet_selections')
    .insert(selectionsToInsert);

  if (selectionsError) {
    await supabase
      .from('combo_bets')
      .delete()
      .eq('id', comboBet.id);

    const rollbackData: any = {
      total_bets: profile.total_bets
    };
    if (currency === 'tokens') {
      rollbackData.tokens = profile.tokens;
    } else {
      rollbackData.diamonds = profile.diamonds;
    }
    await supabase
      .from('profiles')
      .update(rollbackData)
      .eq('id', user.id);
    throw new Error('Erreur lors de la création des sélections');
  }

  return comboBet;
}

export async function getUserBets(status?: 'active' | 'history'): Promise<any[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  let simpleBetsQuery = supabase
    .from('bets')
    .select(`
      *,
      matches:match_id (
        id,
        team_a,
        team_b,
        competition,
        status,
        result,
        match_date
      )
    `)
    .eq('user_id', user.id);

  let comboBetsQuery = supabase
    .from('combo_bets')
    .select(`
      *,
      combo_bet_selections (
        choice,
        odds,
        matches:match_id (
          id,
          team_a,
          team_b,
          competition,
          status,
          result,
          match_date
        )
      )
    `)
    .eq('user_id', user.id);

  if (status === 'active') {
    simpleBetsQuery = simpleBetsQuery.is('is_win', null);
    comboBetsQuery = comboBetsQuery.is('is_win', null);
  } else if (status === 'history') {
    simpleBetsQuery = simpleBetsQuery.not('is_win', 'is', null);
    comboBetsQuery = comboBetsQuery.not('is_win', 'is', null);
  }

  const [simpleBetsResult, comboBetsResult] = await Promise.all([
    simpleBetsQuery.order('created_at', { ascending: false }),
    comboBetsQuery.order('created_at', { ascending: false })
  ]);

  const simpleBets = simpleBetsResult.data || [];
  const comboBets = (comboBetsResult.data || []).map(bet => ({
    ...bet,
    is_combo: true
  }));

  const allBets = [...simpleBets, ...comboBets].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return allBets;
}

export async function resetUserAccount() {
  const response = await fetch('/api/user/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erreur lors de la réinitialisation');
  }

  return response.json();
}

export async function earnTokens(taps: number = 1) {
  console.log('[earnTokens] ========== START ==========');
  console.log('[earnTokens] Called with taps:', taps);

  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.error('[earnTokens] No session found!');
    throw new Error('Non authentifié');
  }

  const tokensEarned = Math.min(taps * 1, 100);

  console.log('[earnTokens] Tokens to earn:', tokensEarned);

  const response = await fetch('/api/user/add-tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ amount: tokensEarned }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('[earnTokens] API error:', error);
    throw new Error(error.error || 'Erreur lors de l\'ajout des jetons');
  }

  const data = await response.json();
  console.log('[earnTokens] API response:', data);

  console.log('[earnTokens] Inserting tap record...');
  const { error: insertError } = await supabase
    .from('tap_earnings')
    .insert({
      user_id: session.user.id,
      tokens_earned: tokensEarned,
    });

  if (insertError) {
    console.warn('[earnTokens] Insert error (non-critical):', insertError);
  }

  window.dispatchEvent(new CustomEvent('profile-updated', {
    detail: {
      tokens: data.data.tokens,
      diamonds: data.data.diamonds
    }
  }));

  const result = {
    tokens_earned: tokensEarned,
    new_balance: data.data.tokens,
    diamonds: data.data.diamonds,
    remaining_taps: null,
  };

  console.log('[earnTokens] ========== SUCCESS ==========');
  console.log('[earnTokens] Returning:', result);

  return result;
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
