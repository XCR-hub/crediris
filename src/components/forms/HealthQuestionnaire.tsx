import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertWithIcon } from '@/components/ui/alert';
import { Heart, AlertTriangle } from 'lucide-react';
import type { HealthQuestionnaire as HealthQuestionnaireType } from '@/lib/afi-esca/types';

const healthQuestionnaireSchema = z.object({
  // Informations générales
  height: z.number().min(100).max(250),
  weight: z.number().min(30).max(200),
  birthDate: z.string(),
  profession: z.string().min(2),
  
  // Habitudes de vie
  smoker: z.boolean(),
  cigarettesPerDay: z.number().optional(),
  alcoholConsumption: z.enum(['NONE', 'OCCASIONAL', 'REGULAR']),
  exerciseFrequency: z.enum(['NEVER', 'OCCASIONAL', 'REGULAR']),
  
  // Antécédents médicaux
  hasChronicCondition: z.boolean(),
  chronicConditionDetails: z.string().optional(),
  hasSurgeryHistory: z.boolean(),
  surgeryHistoryDetails: z.string().optional(),
  currentMedications: z.boolean(),
  medicationDetails: z.string().optional(),
  
  // Maladies et conditions
  hasCardiovascularDisease: z.boolean(),
  hasRespiratoryDisease: z.boolean(),
  hasDiabetes: z.boolean(),
  hasCancer: z.boolean(),
  hasAutoImmuneDisease: z.boolean(),
  hasMusculoskeletalDisorder: z.boolean(),
  hasNeurologicalDisorder: z.boolean(),
  hasMentalHealthDisorder: z.boolean(),
  
  // Antécédents familiaux
  familyHistory: z.object({
    cancer: z.boolean(),
    heartDisease: z.boolean(),
    diabetes: z.boolean(),
  }),
  
  // Activités à risque
  practicesDangerousSports: z.boolean(),
  dangerousSportsDetails: z.string().optional(),
  
  // Notes complémentaires
  additionalNotes: z.string().optional(),
});

interface HealthQuestionnaireProps {
  onSubmit: (data: HealthQuestionnaireType) => void;
  initialData?: Partial<HealthQuestionnaireType>;
  isLoading?: boolean;
}

export function HealthQuestionnaire({
  onSubmit,
  initialData,
  isLoading = false,
}: HealthQuestionnaireProps) {
  const { control, handleSubmit, watch } = useForm<HealthQuestionnaireType>({
    resolver: zodResolver(healthQuestionnaireSchema),
    defaultValues: {
      height: initialData?.height || 170,
      weight: initialData?.weight || 70,
      birthDate: initialData?.birthDate || '',
      profession: initialData?.profession || '',
      smoker: initialData?.smoker || false,
      alcoholConsumption: initialData?.alcoholConsumption || 'NONE',
      exerciseFrequency: initialData?.exerciseFrequency || 'OCCASIONAL',
      hasChronicCondition: initialData?.hasChronicCondition || false,
      hasSurgeryHistory: initialData?.hasSurgeryHistory || false,
      currentMedications: initialData?.currentMedications || false,
      hasCardiovascularDisease: initialData?.hasCardiovascularDisease || false,
      hasRespiratoryDisease: initialData?.hasRespiratoryDisease || false,
      hasDiabetes: initialData?.hasDiabetes || false,
      hasCancer: initialData?.hasCancer || false,
      hasAutoImmuneDisease: initialData?.hasAutoImmuneDisease || false,
      hasMusculoskeletalDisorder: initialData?.hasMusculoskeletalDisorder || false,
      hasNeurologicalDisorder: initialData?.hasNeurologicalDisorder || false,
      hasMentalHealthDisorder: initialData?.hasMentalHealthDisorder || false,
      familyHistory: initialData?.familyHistory || {
        cancer: false,
        heartDisease: false,
        diabetes: false,
      },
      practicesDangerousSports: initialData?.practicesDangerousSports || false,
    },
  });

  const isSmoker = watch('smoker');
  const hasChronicCondition = watch('hasChronicCondition');
  const hasSurgeryHistory = watch('hasSurgeryHistory');
  const currentMedications = watch('currentMedications');
  const practicesDangerousSports = watch('practicesDangerousSports');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <AlertWithIcon
        variant="info"
        icon={Heart}
        title="Questionnaire de santé confidentiel"
        description="Ces informations sont nécessaires pour évaluer votre profil et vous proposer la meilleure couverture possible."
      />

      {/* Informations générales */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Taille (cm)</Label>
            <Controller
              name="height"
              control={control}
              render={({ field }) => (
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              )}
            />
          </div>
          <div>
            <Label>Poids (kg)</Label>
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
              )}
            />
          </div>
          <div>
            <Label>Date de naissance</Label>
            <Controller
              name="birthDate"
              control={control}
              render={({ field }) => (
                <Input type="date" {...field} />
              )}
            />
          </div>
          <div>
            <Label>Profession</Label>
            <Controller
              name="profession"
              control={control}
              render={({ field }) => (
                <Input {...field} />
              )}
            />
          </div>
        </div>
      </section>

      {/* Habitudes de vie */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Habitudes de vie</h3>
        <div className="space-y-6">
          <div>
            <Label>Êtes-vous fumeur ?</Label>
            <Controller
              name="smoker"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="mt-2"
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

          {isSmoker && (
            <div>
              <Label>Nombre de cigarettes par jour</Label>
              <Controller
                name="cigarettesPerDay"
                control={control}
                render={({ field }) => (
                  <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                )}
              />
            </div>
          )}

          <div>
            <Label>Consommation d'alcool</Label>
            <Controller
              name="alcoholConsumption"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NONE" id="alcohol-none" />
                    <Label htmlFor="alcohol-none">Aucune</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OCCASIONAL" id="alcohol-occasional" />
                    <Label htmlFor="alcohol-occasional">Occasionnelle</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="REGULAR" id="alcohol-regular" />
                    <Label htmlFor="alcohol-regular">Régulière</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>

          <div>
            <Label>Activité physique</Label>
            <Controller
              name="exerciseFrequency"
              control={control}
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NEVER" id="exercise-never" />
                    <Label htmlFor="exercise-never">Jamais</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="OCCASIONAL" id="exercise-occasional" />
                    <Label htmlFor="exercise-occasional">Occasionnelle</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="REGULAR" id="exercise-regular" />
                    <Label htmlFor="exercise-regular">Régulière</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
        </div>
      </section>

      {/* Antécédents médicaux */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Antécédents médicaux</h3>
        <div className="space-y-6">
          <div>
            <Label>Avez-vous des maladies chroniques ?</Label>
            <Controller
              name="hasChronicCondition"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="chronic-yes" />
                    <Label htmlFor="chronic-yes">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="chronic-no" />
                    <Label htmlFor="chronic-no">Non</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {hasChronicCondition && (
              <div className="mt-2">
                <Label>Précisez</Label>
                <Controller
                  name="chronicConditionDetails"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      {...field}
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Avez-vous subi des interventions chirurgicales ?</Label>
            <Controller
              name="hasSurgeryHistory"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="surgery-yes" />
                    <Label htmlFor="surgery-yes">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="surgery-no" />
                    <Label htmlFor="surgery-no">Non</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {hasSurgeryHistory && (
              <div className="mt-2">
                <Label>Précisez</Label>
                <Controller
                  name="surgeryHistoryDetails"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      {...field}
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Prenez-vous actuellement des médicaments ?</Label>
            <Controller
              name="currentMedications"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id="medications-yes" />
                    <Label htmlFor="medications-yes">Oui</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id="medications-no" />
                    <Label htmlFor="medications-no">Non</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {currentMedications && (
              <div className="mt-2">
                <Label>Précisez</Label>
                <Controller
                  name="medicationDetails"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      {...field}
                    />
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Maladies et conditions */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Maladies et conditions</h3>
        <div className="space-y-4">
          <CheckboxField
            control={control}
            name="hasCardiovascularDisease"
            label="Maladie cardiovasculaire"
          />
          <CheckboxField
            control={control}
            name="hasRespiratoryDisease"
            label="Maladie respiratoire"
          />
          <CheckboxField
            control={control}
            name="hasDiabetes"
            label="Diabète"
          />
          <CheckboxField
            control={control}
            name="hasCancer"
            label="Cancer"
          />
          <CheckboxField
            control={control}
            name="hasAutoImmuneDisease"
            label="Maladie auto-immune"
          />
          <CheckboxField
            control={control}
            name="hasMusculoskeletalDisorder"
            label="Trouble musculo-squelettique"
          />
          <CheckboxField
            control={control}
            name="hasNeurologicalDisorder"
            label="Trouble neurologique"
          />
          <CheckboxField
            control={control}
            name="hasMentalHealthDisorder"
            label="Trouble de santé mentale"
          />
        </div>
      </section>

      {/* Antécédents familiaux */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Antécédents familiaux</h3>
        <div className="space-y-4">
          <CheckboxField
            control={control}
            name="familyHistory.cancer"
            label="Cancer"
          />
          <CheckboxField
            control={control}
            name="familyHistory.heartDisease"
            label="Maladie cardiaque"
          />
          <CheckboxField
            control={control}
            name="familyHistory.diabetes"
            label="Diabète"
          />
        </div>
      </section>

      {/* Activités à risque */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Activités à risque</h3>
        <div>
          <Label>Pratiquez-vous des sports dangereux ?</Label>
          <Controller
            name="practicesDangerousSports"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(value === 'true')}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="sports-yes" />
                  <Label htmlFor="sports-yes">Oui</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="sports-no" />
                  <Label htmlFor="sports-no">Non</Label>
                </div>
              </RadioGroup>
            )}
          />
          {practicesDangerousSports && (
            <div className="mt-2">
              <Label>Précisez</Label>
              <Controller
                name="dangerousSportsDetails"
                control={control}
                render={({ field }) => (
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    {...field}
                  />
                )}
              />
            </div>
          )}
        </div>
      </section>

      {/* Notes complémentaires */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Notes complémentaires</h3>
        <Controller
          name="additionalNotes"
          control={control}
          render={({ field }) => (
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              placeholder="Ajoutez toute information complémentaire pertinente..."
              {...field}
            />
          )}
        />
      </section>

      <AlertWithIcon
        variant="warning"
        icon={AlertTriangle}
        title="Important"
        description="Toute fausse déclaration ou omission peut entraîner la nullité du contrat d'assurance (Article L.113-8 du Code des assurances)."
      />

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Envoi en cours...' : 'Continuer'}
        </Button>
      </div>
    </form>
  );
}

function CheckboxField({
  control,
  name,
  label,
}: {
  control: any;
  name: any;
  label: string;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id={name}
            checked={field.value}
            onChange={(e) => field.onChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor={name}>{label}</Label>
        </div>
      )}
    />
  );
}