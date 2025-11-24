import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, referralCode } = body;

    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Email, password, and username are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email or username already exists' },
        { status: 400 }
      );
    }

    if (referralCode) {
      const { data: sponsor } = await supabase
        .from('users')
        .select('id')
        .eq('referral_code', referralCode)
        .maybeSingle();

      if (!sponsor) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        );
      }

      const { data: referralLimit } = await supabase
        .rpc('check_referral_rate_limit', { p_sponsor_id: sponsor.id });

      if (!referralLimit) {
        return NextResponse.json(
          { error: 'Referral limit reached. Please try again later.' },
          { status: 429 }
        );
      }
    }

    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      return NextResponse.json(
        { error: signUpError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    const adminClient = createAdminClient();

    const { data: insertData, error: insertError } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        password_hash: 'managed_by_auth',
        username,
        referred_by: referralCode || null,
      })
      .select()
      .single();

    if (insertError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    const { data: wallet } = await adminClient
      .from('wallet')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    await adminClient
      .from('system_logs')
      .insert({
        type: 'user_registration',
        payload: {
          user_id: authData.user.id,
          username,
          email,
          referred_by: referralCode || null,
        },
      });

    return NextResponse.json({
      message: 'User registered successfully',
      user: {
        id: insertData.id,
        email: insertData.email,
        username: insertData.username,
        referralCode: insertData.referral_code,
        avatar: insertData.avatar,
        bio: insertData.bio,
        isAdmin: insertData.is_admin,
        createdAt: insertData.created_at,
      },
      wallet: wallet || null,
      session: authData.session,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
