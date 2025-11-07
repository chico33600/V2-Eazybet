import { supabase } from './supabase-client';
import { NextRequest } from 'next/server';

export async function getAuthUser(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null, error: 'No authorization token provided' };
  }

  const token = authHeader.replace('Bearer ', '');

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: 'Invalid or expired token' };
  }

  return { user, error: null };
}

export async function requireAuth(request: NextRequest) {
  const { user, error } = await getAuthUser(request);

  if (error || !user) {
    return {
      user: null,
      response: Response.json(
        { error: error || 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export function createErrorResponse(message: string, status: number = 400) {
  return Response.json({ success: false, error: message }, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return Response.json({ success: true, data }, { status });
}
