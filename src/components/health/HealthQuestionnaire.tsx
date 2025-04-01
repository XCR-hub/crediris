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
import type { HealthQuestionnaire } from '@/types/database';

const healthQuestionnaireSchema = z.object({
  height: z.number().min(100, 'La taille doit être supérieure à 100 cm').max(250, 'La taille doit être inférieure à 250 cm'),
  weight: z.number().min(30, 'Le poids doit être supérieur à 30 kg').max(200, 'Le poids doit être inférieur à 200 kg'),
  smoker: z.boolean(),
  cigarettes_per_day: z.number().optional(),
  alcohol_consumption: z.enum(['NONE', 'OCCASIONAL', 'REGULAR']),
  exercise_frequency: z.enum(['NEVER', 'OCCASIONAL', 'REGULAR']),
  has_chronic_condition: z.boolean(),
  chronic_condition_details: z.string().optional(),
  has_surgery_history: z.boolean(),
  surgery_history_details: z.string().optional(),
  current_medications: z.boolean(),
  medication_details: z.string().optional(),
  has_cardiovascular_disease: z.boolean(),
  has_respiratory_disease: z.boolean(),
  has_diabetes: z.boolean(),
  has_cancer: z.boolean(),
  has_autoimmune_disease: z.boolean(),
  has_musculoskeletal_disorder: z.boolean(),
  has_neurological_disorder: z.boolean(),
  has_mental_health_disorder: z.boolean(),
  family_history: z.object({
    cancer: z.boolean(),
    heart_disease: z.boolean(),
    diabetes: z.boolean()
  }),
  practices_dangerous_sports: z.boolean(),
  dangerous_sports_details: z.string().optional(),
  additional_notes: z.string().optional()
});

interface HealthQuestionnaireFormProps {
  onSubmit: (data: HealthQuestionnaire) => void;
  onBack: () => void;
  initialData?: Partial<HealthQuestionnaire>;
  isLoading?: boolean;
}

export function HealthQuestionnaireForm({
  onSubmit,
  onBack,
  initialData,
  isLoading = false
}: HealthQuestionnaireFormProps) {
  const { control, handleSubmit, watch } = useForm<HealthQuestionnaire>({
    resolver: zodResolver(healthQuestionnaireSchema),
    defaultValues: {
      height: initialData?.height || 170,
      weight: initialData?.weight || 70,
      smoker: initialData?.smoker || false,
      alcohol_consumption: initialData?.alcohol_consumption || 'NONE',
      exercise_frequency: initialData?.exercise_frequency || 'OCCASIONAL',
      has_chronic_condition: initialData?.has_chronic_condition || false,
      has_surgery_history: initialData?.has_surgery_history || false,
      current_medications: initialData?.current_medications || false,
      has_cardiovascular_disease: initialData?.has_cardiovascular_disease || false,
      has_respiratory_disease: initialData?.has_respiratory_disease || false,
      has_diabetes: initialData?.has_diabetes || false,
      has_cancer: initialData?.has_cancer || false,
      has_autoimmune_disease: initialData?.has_autoimmune_disease || false,
      has_musculoskeletal_disorder: initialData?.has_musculoskeletal_disorder || false,
      has_neurological_disorder: initialData?.has_neurological_disorder || false,
      has_mental_health_disorder: initialData?.has_mental_health_disorder || false,
      family_history: initialData?.family_history || {
        cancer: false,
        heart_disease: false,
        diabetes: false
      },
      practices_dangerous_sports: initialData?.practices_dangerous_sports || false
    }
  });

  const isSmoker = watch('smoker');
  const hasChronicCondition = watch('has_chronic_condition');
  const hasSurgeryHistory = watch('has_surgery_history');
  const currentMedications = watch('current_medications');
  const practicesDangerousSports = watch('practices_dangerous_sports');

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
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                  disabled={isLoading}
                />
              )}
            />
          </div>
          <div>
            <Label>Poids (kg)</Label>
            <Controller
              name="weight"
              control={control}
              render={({ field }) => (
                <Input
                  type="number"
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value))}
                  disabled={isLoading}
                />
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

          {isSmoker && (
            <div>
              <Label>Nombre de cigarettes par jour</Label>
              <Controller
                name="cigarettes_per_day"
                control={control}
                render={({ field }) => (
                  <Input
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    disabled={isLoading}
                  />
                )}
              />
            </div>
          )}

          <div>
            <Label>Consommation d'alcool</Label>
            <Controller
              name="alcohol_consumption"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="mt-2"
                  disabled={isLoading}
                >
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
              name="exercise_frequency"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="mt-2"
                  disabled={isLoading}
                >
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
              name="has_chronic_condition"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="mt-2"
                  disabled={isLoading}
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
                  name="chronic_condition_details"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      {...field}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Avez-vous subi des interventions chirurgicales ?</Label>
            <Controller
              name="has_surgery_history"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="mt-2"
                  disabled={isLoading}
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
                  name="surgery_history_details"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      {...field}
                      disabled={isLoading}
                    />
                  )}
                />
              </div>
            )}
          </div>

          <div>
            <Label>Prenez-vous actuellement des médicaments ?</Label>
            <Controller
              name="current_medications"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value.toString()}
                  onValueChange={(value) => field.onChange(value === 'true')}
                  className="mt-2"
                  disabled={isLoading}
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
                  name="medication_details"
                  control={control}
                  render={({ field }) => (
                    <textarea
                      className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                      {...field}
                      disabled={isLoading}
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
            name="has_cardiovascular_disease"
            label="Maladie cardiovasculaire"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="has_respiratory_disease"
            label="Maladie respiratoire"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="has_diabetes"
            label="Diabète"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="has_cancer"
            label="Cancer"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="has_autoimmune_disease"
            label="Maladie auto-immune"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="has_musculoskeletal_disorder"
            label="Trouble musculo-squelettique"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="has_neurological_disorder"
            label="Trouble neurologique"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="has_mental_health_disorder"
            label="Trouble de santé mentale"
            disabled={isLoading}
          />
        </div>
      </section>

      {/* Antécédents familiaux */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Antécédents familiaux</h3>
        <div className="space-y-4">
          <CheckboxField
            control={control}
            name="family_history.cancer"
            label="Cancer"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="family_history.heart_disease"
            label="Maladie cardiaque"
            disabled={isLoading}
          />
          <CheckboxField
            control={control}
            name="family_history.diabetes"
            label="Diabète"
            disabled={isLoading}
          />
        </div>
      </section>

      {/* Activités à risque */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Activités à risque</h3>
        <div>
          <Label>Pratiquez-vous des sports dangereux ?</Label>
          <Controller
            name="practices_dangerous_sports"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value.toString()}
                onValueChange={(value) => field.onChange(value === 'true')}
                className="mt-2"
                disabled={isLoading}
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
                name="dangerous_sports_details"
                control={control}
                render={({ field }) => (
                  <textarea
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                    {...field}
                    disabled={isLoading}
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
          name="additional_notes"
          control={control}
          render={({ field }) => (
            <textarea
              className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              placeholder="Ajoutez toute information complémentaire pertinente..."
              {...field}
              disabled={isLoading}
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

      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
        >
          Retour
        </Button>
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
  disabled = false
}: {
  control: any;
  name: any;
  label: string;
  disabled?: boolean;
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
            disabled={disabled}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor={name}>{label}</Label>
        </div>
      )}
    />
  );
}