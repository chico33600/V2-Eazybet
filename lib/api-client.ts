import { supabase } from './supabase-client';
import type { Match, Bet } from './supabase-client';

export async function fetchMatches(status?: string): Promise<Match[]> {
  let query = supabase
    .from('matches')
    .select('*')
    .order('start_time', { ascending: true });

  if (status) {
    query = query.eq('status', status.toUpperCase());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return (data || []).map(match => ({
    ...match,
    match_date: match.start_time,
    team_a: match.team_home,
    team_b: match.team_away,
    odds_a: match.odd_home,
    odds_draw: match.odd_draw,
    odds_b: match.odd_away,
    league: match.competition,
    team_a_badge: match.team_home_image,
    team_b_badge: match.team_away_image,
  })) as any;
}

export async function fetchAvailableMatches(mode?: 'fictif' | 'real'): Promise<Match[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  let query = supabase
    .from('matches')
    .select('*')
    .in('status', ['UPCOMING', 'LIVE'])
    .gte('start_time', now.toISOString())
    .lte('start_time', sevenDaysFromNow.toISOString())
    .order('start_time', { ascending: true });

  const { data: matches, error } = await query;

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  const { data: userBets } = await supabase
    .from('bets')
    .select('match_id')
    .eq('user_id', user.id)
    .eq('result', 'PENDING');

  const bettedMatchIds = new Set<string>();

  if (userBets) {
    userBets.forEach(bet => bettedMatchIds.add(bet.match_id));
  }

  const availableMatches = (matches || []).filter(match => !bettedMatchIds.has(match.id));

  return availableMatches.map(match => ({
    ...match,
    match_date: match.start_time,
    team_a: match.team_home,
    team_b: match.team_away,
    odds_a: match.odd_home,
    odds_draw: match.odd_draw,
    odds_b: match.odd_away,
    league: match.competition,
    team_a_badge: match.team_home_image,
    team_b_badge: match.team_away_image,
  })) as any;
}

export async function placeBet(matchId: string, amount: number, choice: 'A' | 'Draw' | 'B', currency: 'tokens' | 'diamonds' = 'tokens') {
  console.log('[placeBet] Starting with:', { matchId, amount, choice, currency });

  const minAmount = currency === 'tokens' ? 10 : 1;
  if (amount < minAmount) {
    throw new Error(`Mise minimum : ${minAmount}`);
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Non authentifié');
  }

  const choiceMap: { [key: string]: string } = {
    'A': 'HOME',
    'Draw': 'DRAW',
    'B': 'AWAY',
  };

  const response = await fetch('/api/bets/place', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      matchId,
      choice: choiceMap[choice],
      amount,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors du pari');
  }

  console.log('[placeBet] Bet placed successfully:', data.bet);

  return data.bet;
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

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Non authentifié');
  }

  const choiceMap: { [key: string]: string } = {
    'A': 'HOME',
    'Draw': 'DRAW',
    'B': 'AWAY',
  };

  const mappedSelections = selections.map(sel => ({
    matchId: sel.matchId,
    choice: choiceMap[sel.choice],
    odds: sel.odds
  }));

  const response = await fetch('/api/bets/place', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      isCombo: true,
      selections: mappedSelections,
      amount,
      currency,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors du pari combiné');
  }

  return data.bet;
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
        team_home,
        team_away,
        competition,
        status,
        result,
        start_time
      )
    `)
    .eq('user_id', user.id);

  if (status === 'active') {
    simpleBetsQuery = simpleBetsQuery.eq('result', 'PENDING');
  } else if (status === 'history') {
    simpleBetsQuery = simpleBetsQuery.in('result', ['WIN', 'LOSE']);
  }

  const simpleBetsResult = await simpleBetsQuery.order('created_at', { ascending: false });
  const simpleBets = (simpleBetsResult.data || []).map(bet => ({
    ...bet,
    is_combo: false,
    matches: bet.matches ? {
      ...bet.matches,
      team_a: bet.matches.team_home,
      team_b: bet.matches.team_away,
      match_date: bet.matches.start_time
    } : null
  }));

  return simpleBets;
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
    console.error('[earnTokens] ❌ No session found!');
    throw new Error('Non authentifié');
  }

  console.log('[earnTokens] ✅ Session found, user:', session.user.id);
  console.log('[earnTokens] 📡 Calling API /api/user/tap-earn...');

  const response = await fetch('/api/user/tap-earn', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ taps }),
  });

  console.log('[earnTokens] API response status:', response.status);

  if (!response.ok) {
    const error = await response.json();
    console.error('[earnTokens] ❌ API error:', error);
    throw new Error(error.error || 'Erreur lors de l\'ajout des jetons');
  }

  const data = await response.json();
  console.log('[earnTokens] ✅ API response data:', data);

  if (!data.success || !data.data) {
    console.error('[earnTokens] ⚠️ Invalid response format:', data);
    throw new Error('Format de réponse invalide');
  }

  const tokensEarned = data.data.tokens_earned;
  const newBalance = data.data.new_balance;
  const diamonds = data.data.diamonds || 0;

  console.log('[earnTokens] 📢 Dispatching profile-updated event...');
  window.dispatchEvent(new CustomEvent('profile-updated', {
    detail: {
      tokens: newBalance,
      diamonds: diamonds
    }
  }));
  console.log('[earnTokens] ✅ Event dispatched');

  const result = {
    tokens_earned: tokensEarned,
    new_balance: newBalance,
    diamonds: diamonds,
    remaining_taps: data.data.remaining_taps,
  };

  console.log('[earnTokens] ========== SUCCESS ==========');
  console.log('[earnTokens] 📦 Returning result:', result);

  return result;
}

export async function getLeaderboard(limit: number = 100, offset: number = 0) {
  const { data: entries, error } = await supabase
    .from('leaderboard')
    .select(`
      rank,
      user_id,
      diamonds,
      total_bets,
      won_bets,
      win_rate,
      users:user_id (
        username,
        avatar
      )
    `)
    .order('rank', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return (entries || []).map((entry: any) => ({
    rank: entry.rank,
    id: entry.user_id,
    username: entry.users?.username || 'Unknown',
    avatar_url: entry.users?.avatar || '',
    diamonds: entry.diamonds,
    total_bets: entry.total_bets,
    won_bets: entry.won_bets,
    win_rate: entry.win_rate,
  }));
}
