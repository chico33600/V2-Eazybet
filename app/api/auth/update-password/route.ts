import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return createErrorResponse('Mot de passe requis', 400);
    }

    if (password.length < 6) {
      return createErrorResponse('Le mot de passe doit contenir au moins 6 caractères', 400);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Non authentifié', 401);
    }

    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      console.error('Password update error:', error);
      return createErrorResponse('Erreur lors de la mise à jour du mot de passe', 500);
    }

    return createSuccessResponse({
      message: 'Mot de passe mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('Update password error:', error);
    return createErrorResponse('Erreur serveur', 500);
  }
}
