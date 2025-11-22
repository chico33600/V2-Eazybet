import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
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

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdminClient();

    // Get current profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('tokens, diamonds')
      .eq('id', user!.id)
      .maybeSingle();

    if (profileError || !profile) {
      console.error('[ADD-TOKENS] Profile error:', profileError);
      return createErrorResponse('Profile not found', 404);
    }

    // Update tokens
    const newTokens = profile.tokens + amount;
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ tokens: newTokens })
      .eq('id', user!.id);

    if (updateError) {
      console.error('[ADD-TOKENS] Update error:', updateError);
      return createErrorResponse('Failed to add tokens', 500);
    }

    console.log(`[ADD-TOKENS] User ${user!.id} earned ${amount} tokens. New balance: ${newTokens}`);

    return createSuccessResponse({
      message: `Successfully added ${amount} tokens`,
      tokens: newTokens,
      diamonds: profile.diamonds,
      added: amount,
    });

  } catch (error: any) {
    console.error('[ADD-TOKENS] Caught error:', error);
    return createErrorResponse(error.message || 'Internal server error', 500);
  }
}
