import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Email invalide'),
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis')
});

interface EmailQuoteFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
}

export function EmailQuoteForm({ onSubmit, isLoading = false }: EmailQuoteFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="firstName">Prénom</Label>
        <Input
          id="firstName"
          {...register('firstName')}
          className={errors.firstName ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.firstName && (
          <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="lastName">Nom</Label>
        <Input
          id="lastName"
          {...register('lastName')}
          className={errors.lastName ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.lastName && (
          <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        <Mail className="h-4 w-4 mr-2" />
        {isLoading ? 'Envoi en cours...' : 'Recevoir par email'}
      </Button>
    </form>
  );
}