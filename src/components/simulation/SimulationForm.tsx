import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertWithIcon } from '@/components/ui/alert';
import { Calculator, Send } from 'lucide-react';
import type { SimulationFormData } from '@/lib/afi-esca/hooks/useAFISimulation';

const formSchema = z.object({
  loan: z.object({
    amount: z.string()
      .transform((val) => parseFloat(val))
      .refine((val) => val >= 10000, 'Le montant minimum est de 10 000 €')
      .refine((val) => val <= 1000000, 'Le montant maximum est de 1 000 000 €'),
    duration: z.string()
      .transform((val) => parseInt(val))
      .refine((val) => val >= 12, 'Durée minimum : 12 mois')
      .refine((val) => val <= 360, 'Durée maximum : 360 mois'),
    rate: z.string()
      .transform((val) => parseFloat(val))
      .refine((val) => val > 0, 'Taux supérieur à 0')
      .refine((val) => val <= 20, 'Taux maximum : 20%'),
    type: z.enum(['MORTGAGE', 'CONSUMER', 'PROFESSIONAL'])
  }),
  insured: z.object({
    gender: z.enum(['HOMME', 'FEMME']),
    birthDate: z.string().min(1, 'Date de naissance requise'),
    profession: z.string().min(2, 'Profession requise'),
    professionalCategory: z.string(),
    smoker: z.boolean(),
    cigarettesPerDay: z.number().optional()
  }),
  coverage: z.object({
    death: z.boolean(),
    ptia: z.boolean(),
    ipt: z.boolean(),
    itt: z.boolean(),
    ipp: z.boolean(),
    quotity: z.number().min(1).max(100)
  })
});

interface SimulationFormProps {
  onSimulate: (data: SimulationFormData) => void;
  isLoading?: boolean;
}

export function SimulationForm({ onSimulate, isLoading = false }: SimulationFormProps) {
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loan: {
        amount: '100000',
        duration: '240',
        rate: '3.5',
        type: 'MORTGAGE'
      },
      insured: {
        gender: 'HOMME',
        birthDate: '',
        profession: '',
        professionalCategory: 'EMPLOYEE',
        smoker: false,
        cigarettesPerDay: 0
      },
      coverage: {
        death: true,
        ptia: false,
        ipt: false,
        itt: false,
        ipp: false,
        quotity: 100
      }
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // Transform data to match SimulationFormData type
      const formattedData: SimulationFormData = {
        loan: {
          amount: parseFloat(data.loan.amount),
          duration: parseInt(data.loan.duration),
          rate: parseFloat(data.loan.rate),
          type: data.loan.type
        },
        insured: {
          gender: data.insured.gender,
          birthDate: data.insured.birthDate,
          profession: data.insured.profession,
          professionalCategory: data.insured.professionalCategory,
          smoker: data.insured.smoker,
          cigarettesPerDay: data.insured.cigarettesPerDay
        },
        coverage: {
          death: data.coverage.death,
          ptia: data.coverage.ptia,
          ipt: data.coverage.ipt,
          itt: data.coverage.itt,
          ipp: data.coverage.ipp,
          quotity: data.coverage.quotity
        }
      };

      await onSimulate(formattedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <AlertWithIcon
        variant="info"
        icon={Calculator}
        title="Simulateur de prêt"
        description="Calculez vos mensualités et le coût total de votre assurance emprunteur en quelques clics."
      />

      {/* Loan Information */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Informations du prêt</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="loan.amount">Montant du prêt (€)</Label>
            <Controller
              name="loan.amount"
              control={control}
              render={({ field }) => (
                <Input
                  id="loan.amount"
                  type="number"
                  {...field}
                  disabled={isLoading}
                  className={errors.loan?.amount ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.loan?.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.loan.amount.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="loan.duration">Durée (mois)</Label>
            <Controller
              name="loan.duration"
              control={control}
              render={({ field }) => (
                <Input
                  id="loan.duration"
                  type="number"
                  {...field}
                  disabled={isLoading}
                  className={errors.loan?.duration ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.loan?.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.loan.duration.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="loan.rate">Taux annuel (%)</Label>
            <Controller
              name="loan.rate"
              control={control}
              render={({ field }) => (
                <Input
                  id="loan.rate"
                  type="number"
                  step="0.01"
                  {...field}
                  disabled={isLoading}
                  className={errors.loan?.rate ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.loan?.rate && (
              <p className="text-red-500 text-sm mt-1">{errors.loan.rate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="loan.type">Type de prêt</Label>
            <Controller
              name="loan.type"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-2 mt-2"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MORTGAGE" id="loan-type-mortgage" />
                    <Label htmlFor="loan-type-mortgage">Immobilier</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONSUMER" id="loan-type-consumer" />
                    <Label htmlFor="loan-type-consumer">Consommation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PROFESSIONAL" id="loan-type-professional" />
                    <Label htmlFor="loan-type-professional">Professionnel</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        </div>
      </section>

      {/* Insured Information */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Informations de l'assuré</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Genre</Label>
            <Controller
              name="insured.gender"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-2 mt-2"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HOMME" id="gender-homme" />
                    <Label htmlFor="gender-homme">Homme</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMME" id="gender-femme" />
                    <Label htmlFor="gender-femme">Femme</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div>
            <Label htmlFor="insured.birthDate">Date de naissance</Label>
            <Controller
              name="insured.birthDate"
              control={control}
              render={({ field }) => (
                <Input
                  id="insured.birthDate"
                  type="date"
                  {...field}
                  disabled={isLoading}
                  className={errors.insured?.birthDate ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.insured?.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.insured.birthDate.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="insured.profession">Profession</Label>
            <Controller
              name="insured.profession"
              control={control}
              render={({ field }) => (
                <Input
                  id="insured.profession"
                  {...field}
                  disabled={isLoading}
                  className={errors.insured?.profession ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.insured?.profession && (
              <p className="text-red-500 text-sm mt-1">{errors.insured.profession.message}</p>
            )}
          </div>

          <div>
            <Label>Catégorie professionnelle</Label>
            <Controller
              name="insured.professionalCategory"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-2 mt-2"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EMPLOYEE" id="cat-employee" />
                    <Label htmlFor="cat-employee">Salarié</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="EXECUTIVE" id="cat-executive" />
                    <Label htmlFor="cat-executive">Cadre</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SELF_EMPLOYED" id="cat-self-employed" />
                    <Label htmlFor="cat-self-employed">TNS</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CIVIL_SERVANT" id="cat-civil-servant" />
                    <Label htmlFor="cat-civil-servant">Fonctionnaire</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div>
            <Label>Fumeur</Label>
            <Controller
              name="insured.smoker"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="space-y-2 mt-2"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="smoker-yes" />
                    <Label htmlFor="smoker-yes">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="smoker-no" />
                    <Label htmlFor="smoker-no">Non</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          {watch('insured.smoker') && (
            <div>
              <Label htmlFor="insured.cigarettesPerDay">Cigarettes par jour</Label>
              <Controller
                name="insured.cigarettesPerDay"
                control={control}
                render={({ field }) => (
                  <Input
                    id="insured.cigarettesPerDay"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                )}
              />
            </div>
          )}
        </div>
      </section>

      {/* Coverage Options */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Garanties souhaitées</h3>
        <div className="space-y-6">
          <div>
            <Label>Garanties principales</Label>
            <div className="space-y-2 mt-2">
              <Controller
                name="coverage.death"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="coverage-death"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="coverage-death">Décès</Label>
                  </div>
                )}
              />

              <Controller
                name="coverage.ptia"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="coverage-ptia"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="coverage-ptia">PTIA</Label>
                  </div>
                )}
              />
            </div>
          </div>

          <div>
            <Label>Garanties complémentaires</Label>
            <div className="space-y-2 mt-2">
              <Controller
                name="coverage.ipt"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="coverage-ipt"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="coverage-ipt">IPT</Label>
                  </div>
                )}
              />

              <Controller
                name="coverage.itt"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="coverage-itt"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="coverage-itt">ITT</Label>
                  </div>
                )}
              />

              <Controller
                name="coverage.ipp"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="coverage-ipp"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="coverage-ipp">IPP</Label>
                  </div>
                )}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="coverage.quotity">Quotité (%)</Label>
            <Controller
              name="coverage.quotity"
              control={control}
              render={({ field }) => (
                <Input
                  id="coverage.quotity"
                  type="number"
                  min="1"
                  max="100"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                  disabled={isLoading}
                  className={errors.coverage?.quotity ? 'border-red-500' : ''}
                />
              )}
            />
            {errors.coverage?.quotity && (
              <p className="text-red-500 text-sm mt-1">{errors.coverage.quotity.message}</p>
            )}
          </div>
        </div>
      </section>

      <div className="flex justify-end pt-6">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Calculator className="h-4 w-4 mr-2 animate-spin" />
              Calcul en cours...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Simuler
            </>
          )}
        </Button>
      </div>
    </form>
  );
}