import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return createErrorResponse('User ID is required', 400);
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://eazybetcoin.app';
    const referralLink = `${baseUrl}/auth?ref=${userId}`;

    const { data: referrals, error: referralsError } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', userId);

    if (referralsError) {
      console.error('Get referrals error:', referralsError);
    }

    const { data: referredBy, error: referredByError } = await supabase
      .from('referrals')
      .select(`
        referrer_id,
        referrer:profiles!referrals_referrer_id_fkey(username, avatar_url, leaderboard_score)
      `)
      .eq('referred_id', userId)
      .maybeSingle();

    if (referredByError) {
      console.error('Get referred by error:', referredByError);
    }

    return createSuccessResponse({
      referralLink,
      referralCount: referrals?.length || 0,
      referrals: referrals || [],
      referredBy: referredBy || null
    });

  } catch (error: any) {
    console.error('Referrals API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referrerId, referredId } = body;

    if (!referrerId || !referredId) {
      return createErrorResponse('Referrer ID and Referred ID are required', 400);
    }

    if (referrerId === referredId) {
      return createErrorResponse('Cannot refer yourself', 400);
    }

    const { data: existingReferral, error: checkError } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_id', referredId)
      .maybeSingle();

    if (checkError) {
      console.error('Check existing referral error:', checkError);
      return createErrorResponse('Failed to check referral', 500);
    }

    if (existingReferral) {
      return createErrorResponse('User was already referred', 400);
    }

    const { data: referrer, error: referrerError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', referrerId)
      .maybeSingle();

    if (referrerError || !referrer) {
      console.error('Referrer not found:', referrerError);
      return createErrorResponse('Invalid referrer', 400);
    }

    const { data: referred, error: referredError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', referredId)
      .maybeSingle();

    if (referredError || !referred) {
      console.error('Referred user not found:', referredError);
      return createErrorResponse('Invalid referred user', 400);
    }

    const { data, error } = await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerId,
        referred_id: referredId,
        rewarded: false
      })
      .select()
      .single();

    if (error) {
      console.error('Create referral error:', error);
      return createErrorResponse('Failed to create referral', 500);
    }

    console.log(`Referral created successfully! Trigger will automatically award diamonds and create friendship.`);

    return createSuccessResponse({
      referral: data,
      message: 'Referral reward granted! Both users received 10 💎 and are now friends!'
    });

  } catch (error: any) {
    console.error('Create referral API error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
