import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { AlertWithIcon } from '@/components/ui/alert';
import { Calculator, ArrowRight, ArrowLeft } from 'lucide-react';

const formSchema = z.object({
  insured: z.object({
    civility: z.enum(['M', 'MME']),
    firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
    lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
    birthDate: z.string().min(1, 'Date de naissance requise'),
    profession: z.string().min(2, 'Profession requise'),
    professionalCategory: z.enum(['EMPLOYEE', 'EXECUTIVE', 'SELF_EMPLOYED', 'CIVIL_SERVANT', 'RETIRED', 'OTHER']),
    smoker: z.boolean(),
    cigarettesPerDay: z.number().optional(),
    height: z.number().min(100).max(250),
    weight: z.number().min(30).max(200)
  }),
  loan: z.object({
    amount: z.number().min(10000).max(1000000),
    duration: z.number().min(12).max(360),
    rate: z.number().min(0.1).max(20),
    type: z.enum(['MORTGAGE', 'CONSUMER', 'PROFESSIONAL']),
    purpose: z.enum(['MAIN_RESIDENCE', 'SECONDARY_RESIDENCE', 'RENTAL_INVESTMENT', 'WORKS', 'OTHER'])
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

type FormData = z.infer<typeof formSchema>;

interface UnifiedSimulationFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function UnifiedSimulationForm({ onSubmit, isLoading = false }: UnifiedSimulationFormProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const { control, handleSubmit, watch, trigger, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      insured: {
        civility: 'M',
        firstName: '',
        lastName: '',
        birthDate: '',
        profession: '',
        professionalCategory: 'EMPLOYEE',
        smoker: false,
        cigarettesPerDay: 0,
        height: 170,
        weight: 70
      },
      loan: {
        amount: 100000,
        duration: 240,
        rate: 3.5,
        type: 'MORTGAGE',
        purpose: 'MAIN_RESIDENCE'
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

  const nextStep = async () => {
    const fields = {
      1: ['insured.firstName', 'insured.lastName', 'insured.birthDate', 'insured.profession'],
      2: ['loan.amount', 'loan.duration', 'loan.rate', 'loan.type', 'loan.purpose'],
      3: ['coverage.death', 'coverage.quotity']
    }[step];

    const isValid = await trigger(fields as any);
    if (isValid) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <AlertWithIcon
        variant="info"
        icon={Calculator}
        title="Simulateur de prêt"
        description="Calculez vos mensualités et le coût total de votre assurance emprunteur en quelques clics."
      />

      <div className="mb-8">
        <Progress value={(step / totalSteps) * 100} className="mb-4" />
        <div className="flex justify-between text-sm text-gray-600">
          <span>Étape {step} sur {totalSteps}</span>
          <span>{Math.round((step / totalSteps) * 100)}%</span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Vos informations</h2>
          
          <div>
            <Label>Civilité</Label>
            <Controller
              name="insured.civility"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex space-x-4 mt-2"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="M" id="civility-m" />
                    <Label htmlFor="civility-m">Monsieur</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MME" id="civility-mme" />
                    <Label htmlFor="civility-mme">Madame</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Controller
                name="insured.firstName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="firstName"
                    {...field}
                    disabled={isLoading}
                    className={errors.insured?.firstName ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.insured?.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.insured.firstName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Controller
                name="insured.lastName"
                control={control}
                render={({ field }) => (
                  <Input
                    id="lastName"
                    {...field}
                    disabled={isLoading}
                    className={errors.insured?.lastName ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.insured?.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.insured.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="birthDate">Date de naissance</Label>
            <Controller
              name="insured.birthDate"
              control={control}
              render={({ field }) => (
                <Input
                  id="birthDate"
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
            <Label htmlFor="profession">Profession</Label>
            <Controller
              name="insured.profession"
              control={control}
              render={({ field }) => (
                <Input
                  id="profession"
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
                  className="grid grid-cols-2 gap-4 mt-2"
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
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RETIRED" id="cat-retired" />
                    <Label htmlFor="cat-retired">Retraité</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHER" id="cat-other" />
                    <Label htmlFor="cat-other">Autre</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Taille (cm)</Label>
              <Controller
                name="insured.height"
                control={control}
                render={({ field }) => (
                  <Input
                    id="height"
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    disabled={isLoading}
                    className={errors.insured?.height ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.insured?.height && (
                <p className="text-red-500 text-sm mt-1">{errors.insured.height.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="weight">Poids (kg)</Label>
              <Controller
                name="insured.weight"
                control={control}
                render={({ field }) => (
                  <Input
                    id="weight"
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    disabled={isLoading}
                    className={errors.insured?.weight ? 'border-red-500' : ''}
                  />
                )}
              />
              {errors.insured?.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.insured.weight.message}</p>
              )}
            </div>
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
                  className="flex space-x-4 mt-2"
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
              <Label htmlFor="cigarettesPerDay">Cigarettes par jour</Label>
              <Controller
                name="insured.cigarettesPerDay"
                control={control}
                render={({ field }) => (
                  <Input
                    id="cigarettesPerDay"
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                )}
              />
            </div>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Votre prêt</h2>
          
          <div>
            <Label htmlFor="amount">Montant du prêt (€)</Label>
            <Controller
              name="loan.amount"
              control={control}
              render={({ field }) => (
                <Input
                  id="amount"
                  type="number"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
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
            <Label htmlFor="duration">Durée (mois)</Label>
            <Controller
              name="loan.duration"
              control={control}
              render={({ field }) => (
                <Input
                  id="duration"
                  type="number"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
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
            <Label htmlFor="rate">Taux annuel (%)</Label>
            <Controller
              name="loan.rate"
              control={control}
              render={({ field }) => (
                <Input
                  id="rate"
                  type="number"
                  step="0.01"
                  {...field}
                  onChange={e => field.onChange(parseFloat(e.target.value))}
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
            <Label>Type de prêt</Label>
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

          <div>
            <Label>Objet du prêt</Label>
            <Controller
              name="loan.purpose"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="space-y-2 mt-2"
                  disabled={isLoading}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MAIN_RESIDENCE" id="purpose-main" />
                    <Label htmlFor="purpose-main">Résidence principale</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="SECONDARY_RESIDENCE" id="purpose-secondary" />
                    <Label htmlFor="purpose-secondary">Résidence secondaire</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RENTAL_INVESTMENT" id="purpose-rental" />
                    <Label htmlFor="purpose-rental">Investissement locatif</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="WORKS" id="purpose-works" />
                    <Label htmlFor="purpose-works">Travaux</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OTHER" id="purpose-other" />
                    <Label htmlFor="purpose-other">Autre</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold">Vos garanties</h2>
          
          <div className="space-y-4">
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
                        id="death"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="death">Décès</Label>
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
                        id="ptia"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="ptia">PTIA</Label>
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
                        id="ipt"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="ipt">IPT</Label>
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
                        id="itt"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="itt">ITT</Label>
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
                        id="ipp"
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        disabled={isLoading}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor="ipp">IPP</Label>
                    </div>
                  )}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quotity">Quotité (%)</Label>
              <Controller
                name="coverage.quotity"
                control={control}
                render={({ field }) => (
                  <Input
                    id="quotity"
                    type="number"
                    min="1"
                    max="100"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
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
        </div>
      )}

      <div className="flex justify-between pt-6">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        )}

        <Button
          type={step === totalSteps ? 'submit' : 'button'}
          onClick={step === totalSteps ? undefined : nextStep}
          disabled={isLoading}
          className="ml-auto"
        >
          {step === totalSteps ? (
            isLoading ? 'Calcul en cours...' : 'Obtenir mon tarif'
          ) : (
            <>
              Continuer
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}