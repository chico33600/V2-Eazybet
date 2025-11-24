import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const ODDS_API_BASE_URL = 'https://api.the-odds-api.com/v4';
const CACHE_DURATION = 10 * 60 * 1000;

let cachedData: { data: any[]; timestamp: number } | null = null;

const LEAGUES_CONFIG = [
  { key: 'soccer_epl', name: 'Premier League', country: 'England' },
  { key: 'soccer_spain_la_liga', name: 'La Liga', country: 'Spain' },
  { key: 'soccer_italy_serie_a', name: 'Serie A', country: 'Italy' },
  { key: 'soccer_germany_bundesliga', name: 'Bundesliga', country: 'Germany' },
  { key: 'soccer_france_ligue_one', name: 'Ligue 1', country: 'France' },
  { key: 'soccer_uefa_champs_league', name: 'UEFA Champions League', country: 'Europe' },
  { key: 'soccer_uefa_europa_league', name: 'UEFA Europa League', country: 'Europe' },
  { key: 'soccer_uefa_europa_conference_league', name: 'UEFA Europa Conference League', country: 'Europe' },
];

interface OddsAPIMatch {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Array<{
    key: string;
    title: string;
    markets: Array<{
      key: string;
      outcomes: Array<{
        name: string;
        price: number;
      }>;
    }>;
  }>;
}

async function fetchMatchesFromOddsAPI(): Promise<any[]> {
  const apiKey = process.env.ODDS_API_KEY;

  if (!apiKey) {
    console.log('[Odds API] No API key configured, returning empty array');
    return [];
  }

  const allMatches: any[] = [];

  for (const league of LEAGUES_CONFIG) {
    try {
      const url = `${ODDS_API_BASE_URL}/sports/${league.key}/odds/?apiKey=${apiKey}&regions=eu&markets=h2h&oddsFormat=decimal`;

      console.log(`[Odds API] Fetching ${league.name}...`);

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error(`[Odds API] Error fetching ${league.name}: ${response.status}`);
        continue;
      }

      const matches: OddsAPIMatch[] = await response.json();

      console.log(`[Odds API] Found ${matches.length} matches for ${league.name}`);

      matches.forEach((match) => {
        const bookmaker = match.bookmakers?.[0];
        const h2hMarket = bookmaker?.markets?.find(m => m.key === 'h2h');

        if (!h2hMarket || !h2hMarket.outcomes || h2hMarket.outcomes.length < 2) {
          return;
        }

        const homeOutcome = h2hMarket.outcomes.find(o => o.name === match.home_team);
        const awayOutcome = h2hMarket.outcomes.find(o => o.name === match.away_team);
        const drawOutcome = h2hMarket.outcomes.find(o => o.name === 'Draw');

        if (!homeOutcome || !awayOutcome) {
          return;
        }

        allMatches.push({
          external_id: match.id,
          team_home: match.home_team,
          team_away: match.away_team,
          competition: league.name,
          odd_home: homeOutcome.price || 2.0,
          odd_draw: drawOutcome?.price || 3.0,
          odd_away: awayOutcome.price || 2.0,
          start_time: match.commence_time,
          status: 'UPCOMING',
        });
      });
    } catch (error) {
      console.error(`[Odds API] Error processing ${league.name}:`, error);
    }
  }

  return allMatches;
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    const { force } = body;

    if (!force) {
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
        console.log('[Odds API] Returning cached data');
        return NextResponse.json({
          message: 'Using cached data',
          matches: cachedData.data,
          cached: true,
        });
      }
    }

    console.log('[Odds API] Fetching fresh data from API...');
    const matches = await fetchMatchesFromOddsAPI();

    cachedData = {
      data: matches,
      timestamp: Date.now(),
    };

    const supabase = createAdminClient();

    let insertedCount = 0;
    let updatedCount = 0;

    for (const match of matches) {
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('id')
        .eq('external_id', match.external_id)
        .maybeSingle();

      if (existingMatch) {
        await supabase
          .from('matches')
          .update({
            odd_home: match.odd_home,
            odd_draw: match.odd_draw,
            odd_away: match.odd_away,
            updated_at: new Date().toISOString(),
          })
          .eq('external_id', match.external_id);
        updatedCount++;
      } else {
        await supabase
          .from('matches')
          .insert({
            ...match,
            team_home_image: '',
            team_away_image: '',
          });
        insertedCount++;
      }
    }

    await supabase
      .from('system_logs')
      .insert({
        type: 'odds_api_sync',
        payload: {
          total: matches.length,
          inserted: insertedCount,
          updated: updatedCount,
        },
      });

    console.log(`[Odds API] Sync complete: ${insertedCount} inserted, ${updatedCount} updated`);

    return NextResponse.json({
      message: 'Matches synced successfully',
      total: matches.length,
      inserted: insertedCount,
      updated: updatedCount,
      cached: false,
    });

  } catch (error: any) {
    console.error('[Odds API] Sync error:', error);

    return NextResponse.json({
      message: 'Odds API not available, matches may be limited',
      total: 0,
      inserted: 0,
      updated: 0,
      cached: false,
      warning: 'ODDS_API_KEY not configured. Add it to enable real matches.',
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        matches: cachedData.data,
        cached: true,
        cacheAge: Math.floor((Date.now() - cachedData.timestamp) / 1000),
      });
    }

    return NextResponse.json({
      matches: [],
      cached: false,
      message: 'No cached data available. Use POST to fetch fresh data.',
    });

  } catch (error: any) {
    console.error('[Odds API] Get error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
