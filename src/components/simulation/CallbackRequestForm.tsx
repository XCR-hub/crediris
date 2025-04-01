import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Phone } from 'lucide-react';

const formSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis'),
  lastName: z.string().min(2, 'Nom requis'),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  preferredTime: z.enum(['MORNING', 'AFTERNOON', 'EVENING'])
});

interface CallbackRequestFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isLoading?: boolean;
}

export function CallbackRequestForm({ onSubmit, isLoading = false }: CallbackRequestFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      preferredTime: 'AFTERNOON'
    }
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
        <Label htmlFor="phone">Téléphone</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          className={errors.phone ? 'border-red-500' : ''}
          disabled={isLoading}
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label>Moment préféré pour être rappelé</Label>
        <Controller
          name="preferredTime"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="space-y-2 mt-2"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MORNING" id="time-morning" />
                <Label htmlFor="time-morning">Matin (9h-12h)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="AFTERNOON" id="time-afternoon" />
                <Label htmlFor="time-afternoon">Après-midi (14h-17h)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="EVENING" id="time-evening" />
                <Label htmlFor="time-evening">Soir (17h-19h)</Label>
              </div>
            </RadioGroup>
          )}
        />
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        <Phone className="h-4 w-4 mr-2" />
        {isLoading ? 'Envoi en cours...' : 'Demander à être rappelé'}
      </Button>
    </form>
  );
}