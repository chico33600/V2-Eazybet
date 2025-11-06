import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    // Validation
    if (!email || !password || !username) {
      return createErrorResponse('Email, password, and username are required', 400);
    }

    if (password.length < 6) {
      return createErrorResponse('Password must be at least 6 characters', 400);
    }

    if (username.length < 3) {
      return createErrorResponse('Username must be at least 3 characters', 400);
    }

    // Check if username already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existingProfile) {
      return createErrorResponse('Ce pseudo est déjà utilisé.', 400);
    }

    // Check if email already exists
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    const emailExists = existingUser?.users?.some(user => user.email === email);

    if (emailExists) {
      return createErrorResponse('Cet e-mail est déjà utilisé.', 400);
    }

    // Create user account
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return createErrorResponse('Ce pseudo ou cet e-mail est déjà utilisé.', 400);
      }
      return createErrorResponse(error.message, 400);
    }

    if (!data.user) {
      return createErrorResponse('Failed to create user', 500);
    }

    return createSuccessResponse({
      message: 'User registered successfully',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: data.session,
    }, 201);

  } catch (error: any) {
    console.error('Registration error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}
