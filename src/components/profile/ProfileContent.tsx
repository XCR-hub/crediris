import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Layout } from '@/components/ui/layout';
import { supabase } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { safeNavigate } from '@/lib/navigation';
import { toast } from '@/lib/hooks/useToast';
import { User, Save, Loader2 } from 'lucide-react';
import type { User as UserType } from '@/types/database';

const formSchema = z.object({
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  address: z.string().min(5, 'L\'adresse doit contenir au moins 5 caractères'),
  city: z.string().min(2, 'La ville doit contenir au moins 2 caractères'),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
});

type FormData = z.infer<typeof formSchema>;

export function ProfileContent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { user: authUser, error: authError } = await getCurrentUser();
        
        if (authError || !authUser) {
          console.error('Erreur authentification:', authError?.message);
          safeNavigate(navigate, '/signin');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (profileError) {
          console.error('Erreur chargement profil:', profileError.message);
          toast({
            variant: "error",
            title: "Erreur",
            description: "Impossible de charger votre profil"
          });
          return;
        }

        setUser(profile);
        if (profile) {
          reset({
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            phone: profile.phone || '',
            address: profile.address || '',
            city: profile.city || '',
            postalCode: profile.postal_code || '',
          });
        }
      } catch (error) {
        console.error('Erreur inattendue:', error);
        toast({
          variant: "error",
          title: "Erreur",
          description: "Une erreur inattendue s'est produite"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate, reset]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const { user: authUser, error: authError } = await getCurrentUser();
      
      if (authError || !authUser?.id) {
        console.error('Erreur utilisateur:', authError?.message);
        safeNavigate(navigate, '/signin');
        return;
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postal_code: data.postalCode,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authUser.id);

      if (updateError) {
        console.error('Erreur mise à jour profil:', updateError.message);
        toast({
          variant: "error",
          title: "Erreur",
          description: "Erreur lors de la mise à jour du profil"
        });
        return;
      }

      toast({
        variant: "success",
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées"
      });
    } catch (error) {
      console.error('Erreur inattendue:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur inattendue s'est produite"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="flex items-center gap-2 text-lg">
            <Loader2 className="h-5 w-5 animate-spin" />
            Chargement en cours...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <User className="h-6 w-6 mr-2" />
            Mon Profil
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos informations personnelles
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  type="text"
                  disabled={isSubmitting}
                  {...register('firstName')}
                  className={errors.firstName ? 'border-red-500' : ''}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  type="text"
                  disabled={isSubmitting}
                  {...register('lastName')}
                  className={errors.lastName ? 'border-red-500' : ''}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  type="tel"
                  disabled={isSubmitting}
                  {...register('phone')}
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  type="text"
                  disabled={isSubmitting}
                  {...register('address')}
                  className={errors.address ? 'border-red-500' : ''}
                />
                {errors.address && (
                  <p className="text-red-500 text-sm">{errors.address.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input
                  id="city"
                  type="text"
                  disabled={isSubmitting}
                  {...register('city')}
                  className={errors.city ? 'border-red-500' : ''}
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input
                  id="postalCode"
                  type="text"
                  disabled={isSubmitting}
                  {...register('postalCode')}
                  className={errors.postalCode ? 'border-red-500' : ''}
                />
                {errors.postalCode && (
                  <p className="text-red-500 text-sm">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Save className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}