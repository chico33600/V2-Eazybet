import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return createErrorResponse('E-mail requis', 400);
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:5000'}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return createErrorResponse('Erreur lors de l\'envoi de l\'e-mail', 500);
    }

    return createSuccessResponse({
      message: 'Si cet e-mail existe, un lien de réinitialisation a été envoyé.'
    });

  } catch (error: any) {
    console.error('Forgot password error:', error);
    return createErrorResponse('Erreur serveur', 500);
  }
}
