import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
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

    const { tokenAmount } = await request.json();

    if (!tokenAmount || tokenAmount < 100) {
      return NextResponse.json(
        { error: 'Minimum 100 tokens required for conversion' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .rpc('convert_tokens_to_diamonds', {
        p_user_id: user.id,
        p_token_amount: tokenAmount,
      });

    if (error || !data?.success) {
      return NextResponse.json(
        { error: data?.error || 'Conversion failed' },
        { status: 400 }
      );
    }

    const { data: wallet } = await supabase
      .from('wallet')
      .select('*')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      message: 'Conversion successful',
      wallet,
      conversion: {
        tokensSpent: data.tokens_spent,
        diamondsEarned: data.diamonds_earned,
      },
    });

  } catch (error: any) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
