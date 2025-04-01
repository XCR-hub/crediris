import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signUp } from '@/lib/auth';
import { safeNavigate } from '@/lib/navigation';
import { ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

function SignUp() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      const { data: authData, error: authError } = await signUp(data.email, data.password);

      if (authError) {
        console.error('Erreur inscription:', authError.message);
        alert(authError.message);
        return;
      }

      if (authData?.user) {
        safeNavigate(navigate, '/signin');
      } else {
        console.error('Erreur: Données utilisateur manquantes après inscription');
        alert("Une erreur s'est produite lors de l'inscription. Veuillez réessayer.");
      }
    } catch (error) {
      console.error('Erreur inattendue:', error);
      alert("Une erreur s'est produite. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre de navigation fixe */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="font-bold text-xl text-primary">
              CREDIRIS
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/garanties" className="text-gray-600 hover:text-primary">
                Garanties
              </Link>
              <Link to="/faq" className="text-gray-600 hover:text-primary">
                FAQ
              </Link>
              <Link to="/simulation">
                <Button variant="outline">Simuler</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu principal */}
      <div className="pt-16 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-6 mx-auto flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
            Inscription
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Créez votre compte pour finaliser votre souscription
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  disabled={isLoading}
                  {...register('email')}
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  disabled={isLoading}
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  disabled={isLoading}
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'border-red-500' : ''}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Inscription...' : "S'inscrire"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  onClick={() => safeNavigate(navigate, '/signin')}
                  className="text-primary hover:text-primary/90 font-medium"
                  disabled={isLoading}
                >
                  Se connecter
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;