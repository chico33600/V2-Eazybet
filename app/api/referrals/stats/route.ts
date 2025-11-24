import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single();

    const { data: referrals, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred_user:referred_user_id (
          id,
          username,
          email,
          created_at
        )
      `)
      .eq('sponsor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch referral stats' },
        { status: 500 }
      );
    }

    const stats = {
      totalReferrals: referrals?.length || 0,
      bonusesGiven: referrals?.filter(r => r.bonus_given).length || 0,
      pendingBonuses: referrals?.filter(r => !r.bonus_given).length || 0,
    };

    return NextResponse.json({
      referralCode: userData?.referral_code,
      stats,
      referrals: referrals || [],
    });

  } catch (error: any) {
    console.error('Referral stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
