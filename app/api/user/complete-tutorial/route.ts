import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const supabase = createClient();

    const { error: updateError } = await supabase
      .from('users')
      .update({ has_seen_tutorial: true })
      .eq('id', user!.id);

    if (updateError) {
      console.error('Tutorial update error:', updateError);
      return createErrorResponse('Failed to update tutorial status', 500);
    }

    return createSuccessResponse({
      message: 'Tutorial completed',
    });

  } catch (error: any) {
    console.error('Complete tutorial error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
