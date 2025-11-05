import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  try {
    const { data: comboBets } = await supabase
      .from('combo_bets')
      .select('id')
      .eq('user_id', user.id);

    if (comboBets && comboBets.length > 0) {
      const comboBetIds = comboBets.map(bet => bet.id);
      await supabase
        .from('combo_bet_selections')
        .delete()
        .in('combo_bet_id', comboBetIds);
    }

    await supabase
      .from('combo_bets')
      .delete()
      .eq('user_id', user.id);

    await supabase
      .from('bets')
      .delete()
      .eq('user_id', user.id);

    await supabase
      .from('tap_earnings')
      .delete()
      .eq('user_id', user.id);

    const { error: updateError } = await supabase
      .from('users')
      .update({
        tokens_balance: 0,
        diamonds_balance: 0,
        total_bets: 0,
        total_wins: 0
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error resetting user profile:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la réinitialisation' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Compte réinitialisé avec succès',
      profile: {
        tokens_balance: 0,
        diamonds_balance: 0,
        total_bets: 0,
        total_wins: 0
      }
    });
  } catch (error) {
    console.error('Error resetting account:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
