import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET(request: NextRequest) {
  try {

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true });

    if (achievementsError) {
      return NextResponse.json({ error: achievementsError.message }, { status: 500 });
    }

    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user.id);

    if (userAchievementsError) {
      return NextResponse.json({ error: userAchievementsError.message }, { status: 500 });
    }

    const claimedIds = userAchievements?.map(ua => ua.achievement_id) || [];

    const achievementsWithStatus = achievements?.map(achievement => ({
      ...achievement,
      claimed: claimedIds.includes(achievement.id)
    })) || [];

    return NextResponse.json({ achievements: achievementsWithStatus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
