import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 500 }
      );
    }

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    const { data: wallet } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', data.user.id)
      .single();

    await supabase
      .from('system_logs')
      .insert({
        type: 'user_login',
        payload: {
          user_id: data.user.id,
          email: data.user.email,
        },
      });

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        referralCode: user.referral_code,
        avatar: user.avatar,
        bio: user.bio,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
      },
      wallet: wallet || null,
      session: data.session,
      access_token: data.session.access_token,
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
