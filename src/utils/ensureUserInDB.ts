import { supabase } from '@/lib/supabase';

export async function ensureUserInDB(user: { id: string, email: string }): Promise<boolean> {
  try {
    const { data: existing, error: selectError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (selectError) {
      console.error("Erreur vérification user:", selectError);
      return false;
    }

    if (!existing) {
      const { error: insertError } = await supabase
        .from('users')
        .upsert([{ id: user.id, email: user.email }], { onConflict: ['id'] });

      if (insertError) {
        console.error("Erreur ajout user:", insertError);
        return false;
      }
    }

    return true;
  } catch (err) {
    console.error("Erreur inconnue ensureUserInDB:", err);
    return false;
  }
}
