import { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
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
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .neq('id', user.id)
        .maybeSingle();

      if (existingProfile) {
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
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;

    if (Object.keys(updates).length > 0) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
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

    const { data: updatedProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    return createSuccessResponse({
      message: 'Profil mis à jour avec succès',
      profile: updatedProfile
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return createErrorResponse('Erreur serveur', 500);
  }
}
