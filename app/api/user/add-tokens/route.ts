import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { amount } = body;

    if (!amount || typeof amount !== 'number') {
      return createErrorResponse('Amount is required and must be a number', 400);
    }

    if (amount < 1 || amount > 100) {
      return createErrorResponse('Amount must be between 1 and 100', 400);
    }

    const supabaseAdmin = createAdminClient();

    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('wallet')
      .select('tokens, diamonds, total_earned_tokens')
      .eq('user_id', user!.id)
      .single();

    if (walletError || !wallet) {
      console.error('[ADD-TOKENS] Wallet error:', walletError);
      return createErrorResponse('Wallet not found', 404);
    }

    const newTokens = wallet.tokens + amount;
    const { error: updateError } = await supabaseAdmin
      .from('wallet')
      .update({
        tokens: newTokens,
        total_earned_tokens: wallet.total_earned_tokens + amount,
      })
      .eq('user_id', user!.id);

    if (updateError) {
      console.error('[ADD-TOKENS] Update error:', updateError);
      return createErrorResponse('Failed to add tokens', 500);
    }

    console.log(`[ADD-TOKENS] User ${user!.id} earned ${amount} tokens. New balance: ${newTokens}`);

    return createSuccessResponse({
      message: `Successfully added ${amount} tokens`,
      tokens: newTokens,
      diamonds: wallet.diamonds,
      added: amount,
    });

  } catch (error: any) {
    console.error('[ADD-TOKENS] Caught error:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}
