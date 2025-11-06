import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { achievementId } = body;

    if (!achievementId) {
      return NextResponse.json({ error: 'ID de réalisation manquant' }, { status: 400 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { data: existingClaim } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', user.id)
      .eq('achievement_id', achievementId)
      .maybeSingle();

    if (existingClaim) {
      return NextResponse.json({ error: 'Vous avez déjà récupéré cette récompense' }, { status: 400 });
    }

    const { data: achievement, error: achievementError } = await supabase
      .from('achievements')
      .select('reward')
      .eq('id', achievementId)
      .maybeSingle();

    if (achievementError || !achievement) {
      return NextResponse.json({ error: 'Réalisation introuvable' }, { status: 404 });
    }

    const { error: claimError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: user.id,
        achievement_id: achievementId
      });

    if (claimError) {
      return NextResponse.json({ error: claimError.message }, { status: 500 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('tokens')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ tokens: profile.tokens + achievement.reward })
      .eq('id', user.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reward: achievement.reward,
      newBalance: profile.tokens + achievement.reward
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
