import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: finishedMatches, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('status', 'FINISHED')
      .not('score_home', 'is', null)
      .not('score_away', 'is', null);

    if (matchError) {
      throw matchError;
    }

    let processedCount = 0;

    for (const match of finishedMatches || []) {
      const { data: pendingBets } = await supabase
        .from('bets')
        .select('*')
        .eq('match_id', match.id)
        .eq('result', 'PENDING');

      if (!pendingBets || pendingBets.length === 0) {
        continue;
      }

      let winningChoice: 'HOME' | 'DRAW' | 'AWAY';
      if (match.score_home > match.score_away) {
        winningChoice = 'HOME';
      } else if (match.score_home < match.score_away) {
        winningChoice = 'AWAY';
      } else {
        winningChoice = 'DRAW';
      }

      for (const bet of pendingBets) {
        if (bet.choice === winningChoice) {
          let winningOdd: number;
          if (winningChoice === 'HOME') {
            winningOdd = match.odd_home;
          } else if (winningChoice === 'AWAY') {
            winningOdd = match.odd_away;
          } else {
            winningOdd = match.odd_draw;
          }

          const calculatedGain = Math.floor(bet.amount * winningOdd);

          await supabase
            .from('bets')
            .update({
              result: 'WIN',
              gain: calculatedGain,
            })
            .eq('id', bet.id);

          const { data: wallet } = await supabase
            .from('wallet')
            .select('tokens, total_earned_tokens')
            .eq('user_id', bet.user_id)
            .single();

          if (wallet) {
            await supabase
              .from('wallet')
              .update({
                tokens: wallet.tokens + calculatedGain,
                total_earned_tokens: wallet.total_earned_tokens + calculatedGain,
              })
              .eq('user_id', bet.user_id);
          }

          await supabase
            .from('system_logs')
            .insert({
              type: 'bet_auto_resolved_win',
              payload: {
                bet_id: bet.id,
                user_id: bet.user_id,
                match_id: match.id,
                gain: calculatedGain,
              },
            });
        } else {
          await supabase
            .from('bets')
            .update({
              result: 'LOSE',
              gain: 0,
            })
            .eq('id', bet.id);

          await supabase
            .from('system_logs')
            .insert({
              type: 'bet_auto_resolved_lose',
              payload: {
                bet_id: bet.id,
                user_id: bet.user_id,
                match_id: match.id,
              },
            });
        }
        processedCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${processedCount} bets`,
        processedCount,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Auto resolve error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});