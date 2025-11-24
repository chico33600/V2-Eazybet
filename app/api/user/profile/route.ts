import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const supabase = createClient();

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user!.id)
      .maybeSingle();

    if (userError || !userData) {
      return createErrorResponse('Failed to fetch user', 500);
    }

    const { data: walletData, error: walletError } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (walletError || !walletData) {
      return createErrorResponse('Failed to fetch wallet', 500);
    }

    const totalBets = walletData.total_bets || 0;
    const wonBets = walletData.won_bets || 0;

    return createSuccessResponse({
      profile: {
        id: userData.id,
        username: userData.username,
        avatar_url: userData.avatar || '',
        tokens: walletData.tokens,
        diamonds: walletData.diamonds,
        total_bets: totalBets,
        won_bets: wonBets,
        win_rate: totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0,
        created_at: userData.created_at,
      },
    });

  } catch (error: any) {
    console.error('Profile fetch error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const supabase = createClient();
    const body = await request.json();
    const { username, avatar_url } = body;

    const updates: any = {};

    if (username !== undefined) {
      if (username.length < 3) {
        return createErrorResponse('Username must be at least 3 characters', 400);
      }

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', user!.id)
        .maybeSingle();

      if (existingUser) {
        return createErrorResponse('Username already taken', 400);
      }

      updates.username = username;
    }

    if (avatar_url !== undefined) {
      updates.avatar = avatar_url;
    }

    if (Object.keys(updates).length === 0) {
      return createErrorResponse('No valid fields to update', 400);
    }

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user!.id)
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return createErrorResponse('Failed to update profile', 500);
    }

    return createSuccessResponse({
      message: 'Profile updated successfully',
      profile: data,
    });

  } catch (error: any) {
    console.error('Profile update error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
