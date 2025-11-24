import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  try {
    const body = await request.json();
    const { username, email, password, avatar_url } = body;

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return createErrorResponse('Non authentifié', 401);
    }

    if (username && username.length < 3) {
      return createErrorResponse('Le pseudo doit contenir au moins 3 caractères', 400);
    }

    if (username) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        return createErrorResponse('Ce pseudo est déjà utilisé', 400);
      }
    }

    if (email && email !== user.email) {
      const { data: existingUser } = await supabase.auth.admin.listUsers();
      const emailExists = existingUser?.users?.some(u => u.email === email && u.id !== user.id);

      if (emailExists) {
        return createErrorResponse('Cet e-mail est déjà utilisé', 400);
      }
    }

    const updates: any = {};
    if (username) updates.username = username;
    if (avatar_url !== undefined) updates.avatar = avatar_url;

    if (Object.keys(updates).length > 0) {
      const { error: userError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (userError) {
        console.error('User update error:', userError);
        return createErrorResponse('Erreur lors de la mise à jour du profil', 500);
      }
    }

    const authUpdates: any = {};
    if (email && email !== user.email) authUpdates.email = email;
    if (password) authUpdates.password = password;

    if (Object.keys(authUpdates).length > 0) {
      const { error: authUpdateError } = await supabase.auth.updateUser(authUpdates);

      if (authUpdateError) {
        console.error('Auth update error:', authUpdateError);
        return createErrorResponse('Erreur lors de la mise à jour des identifiants', 500);
      }
    }

    const { data: updatedUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return createSuccessResponse({
      message: 'Profil mis à jour avec succès',
      profile: updatedUser
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return createErrorResponse('Erreur serveur', 500);
  }
}
