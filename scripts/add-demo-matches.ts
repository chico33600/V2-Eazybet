import { createClient } from '@supabase/supabase-js';
import { getTeamImages } from '../lib/team-images-static';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEMO_MATCHES = [
  {
    team_a: 'PSG',
    team_b: 'Marseille',
    competition: 'Ligue 1',
    odds_a: 1.85,
    odds_draw: 3.40,
    odds_b: 4.20,
    hours_from_now: 24
  },
  {
    team_a: 'Lyon',
    team_b: 'Monaco',
    competition: 'Ligue 1',
    odds_a: 2.30,
    odds_draw: 3.20,
    odds_b: 3.10,
    hours_from_now: 48
  },
  {
    team_a: 'Manchester United',
    team_b: 'Liverpool',
    competition: 'Premier League',
    odds_a: 3.10,
    odds_draw: 3.40,
    odds_b: 2.20,
    hours_from_now: 36
  },
  {
    team_a: 'Arsenal',
    team_b: 'Chelsea',
    competition: 'Premier League',
    odds_a: 2.00,
    odds_draw: 3.50,
    odds_b: 3.60,
    hours_from_now: 60
  },
  {
    team_a: 'Manchester City',
    team_b: 'Tottenham',
    competition: 'Premier League',
    odds_a: 1.60,
    odds_draw: 4.00,
    odds_b: 5.50,
    hours_from_now: 72
  },
  {
    team_a: 'Real Madrid',
    team_b: 'Barcelona',
    competition: 'La Liga',
    odds_a: 2.10,
    odds_draw: 3.30,
    odds_b: 3.40,
    hours_from_now: 96
  },
  {
    team_a: 'Atletico Madrid',
    team_b: 'Sevilla',
    competition: 'La Liga',
    odds_a: 1.90,
    odds_draw: 3.40,
    odds_b: 4.10,
    hours_from_now: 120
  },
  {
    team_a: 'Inter',
    team_b: 'AC Milan',
    competition: 'Serie A',
    odds_a: 2.20,
    odds_draw: 3.20,
    odds_b: 3.30,
    hours_from_now: 108
  },
  {
    team_a: 'Juventus',
    team_b: 'Napoli',
    competition: 'Serie A',
    odds_a: 2.40,
    odds_draw: 3.10,
    odds_b: 3.00,
    hours_from_now: 84
  },
  {
    team_a: 'Bayern',
    team_b: 'Dortmund',
    competition: 'Bundesliga',
    odds_a: 1.70,
    odds_draw: 3.80,
    odds_b: 4.80,
    hours_from_now: 132
  },
  {
    team_a: 'Leverkusen',
    team_b: 'RB Leipzig',
    competition: 'Bundesliga',
    odds_a: 2.10,
    odds_draw: 3.30,
    odds_b: 3.50,
    hours_from_now: 144
  },
  {
    team_a: 'Nice',
    team_b: 'Lille',
    competition: 'Ligue 1',
    odds_a: 2.50,
    odds_draw: 3.10,
    odds_b: 2.90,
    hours_from_now: 156
  },
];

async function addDemoMatches() {
  console.log('Adding demo matches...');

  for (const match of DEMO_MATCHES) {
    const teamAImages = getTeamImages(match.team_a);
    const teamBImages = getTeamImages(match.team_b);

    const matchDate = new Date();
    matchDate.setHours(matchDate.getHours() + match.hours_from_now);

    const { error } = await supabase
      .from('matches')
      .insert({
        team_a: match.team_a,
        team_b: match.team_b,
        competition: match.competition,
        odds_a: match.odds_a,
        odds_draw: match.odds_draw,
        odds_b: match.odds_b,
        status: 'upcoming',
        match_date: matchDate.toISOString(),
        match_mode: 'real',
        team_a_badge: teamAImages?.badge || null,
        team_a_banner: teamAImages?.banner || null,
        team_a_stadium: teamAImages?.stadium || null,
        team_b_badge: teamBImages?.badge || null,
        team_b_banner: teamBImages?.banner || null,
        team_b_stadium: teamBImages?.stadium || null,
      });

    if (error) {
      console.error(`Error adding match ${match.team_a} vs ${match.team_b}:`, error);
    } else {
      console.log(`✓ Added: ${match.team_a} vs ${match.team_b}`);
    }
  }

  console.log('\nDemo matches added successfully!');
}

addDemoMatches();
