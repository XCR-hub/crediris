import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertWithIcon } from '@/components/ui/alert';
import { Heart, AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/hooks/useToast';

const addressSchema = z.object({
  number: z.string().min(1, 'Numéro requis'),
  streetType: z.string().min(1, 'Type de voie requis'),
  street: z.string().min(1, 'Nom de voie requis'),
  complement: z.string().optional(),
  postalCode: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  city: z.string().min(1, 'Ville requise'),
  country: z.string().default('FRANCE')
});

const personalInfoSchema = z.object({
  civility: z.enum(['M', 'MME'], {
    required_error: 'Civilité requise'
  }),
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  maidenName: z.string().optional(),
  birthDate: z.string().min(1, 'Date de naissance requise'),
  birthPlace: z.string().min(1, 'Lieu de naissance requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide'),
  address: addressSchema,
  profession: z.string().min(2, 'Profession requise'),
  professionalCategory: z.enum([
    'EMPLOYEE',
    'EXECUTIVE',
    'SELF_EMPLOYED',
    'CIVIL_SERVANT',
    'RETIRED',
    'OTHER'
  ], {
    required_error: 'Catégorie professionnelle requise'
  })
});

const bankInfoSchema = z.object({
  name: z.string().min(2, 'Nom de la banque requis'),
  address: addressSchema,
  contact: z.object({
    name: z.string().optional(),
    phone: z.string().regex(/^(\+33|0)[1-9](\d{2}){4}$/, 'Numéro de téléphone invalide').optional(),
    email: z.string().email('Email invalide').optional()
  }).optional()
});

const formSchema = z.object({
  personalInfo: personalInfoSchema,
  bankInfo: bankInfoSchema
});

type FormData = z.infer<typeof formSchema>;

interface InsuranceQuestionnaireProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function InsuranceQuestionnaire({
  onSubmit,
  isLoading = false
}: InsuranceQuestionnaireProps) {
  const [step, setStep] = useState<'PERSONAL' | 'BANK'>('PERSONAL');
  
  const { control, handleSubmit, watch, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      personalInfo: {
        civility: 'M',
        firstName: '',
        lastName: '',
        maidenName: '',
        birthDate: '',
        birthPlace: '',
        email: '',
        phone: '',
        address: {
          number: '',
          streetType: '',
          street: '',
          complement: '',
          postalCode: '',
          city: '',
          country: 'FRANCE'
        },
        profession: '',
        professionalCategory: 'EMPLOYEE'
      },
      bankInfo: {
        name: '',
        address: {
          number: '',
          streetType: '',
          street: '',
          complement: '',
          postalCode: '',
          city: '',
          country: 'FRANCE'
        },
        contact: {
          name: '',
          phone: '',
          email: ''
        }
      }
    }
  });

  const onFormSubmit = async (data: FormData) => {
    try {
      if (!isValid) {
        toast({
          variant: "error",
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires"
        });
        return;
      }

      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        variant: "error",
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi du formulaire"
      });
    }
  };

  const handleNext = () => {
    const personalFields = ['personalInfo.firstName', 'personalInfo.lastName', 'personalInfo.email'];
    const hasErrors = personalFields.some(field => errors[field]);
    
    if (hasErrors) {
      toast({
        variant: "error",
        title: "Erreur",
        description: "Veuillez corriger les erreurs avant de continuer"
      });
      return;
    }
    
    setStep('BANK');
  };

  const handlePrevious = () => {
    setStep('PERSONAL');
  };

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informations personnelles</h2>

      <div className="space-y-4">
        <div>
          <Label>Civilité</Label>
          <Controller
            name="personalInfo.civility"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex space-x-4 mt-2"
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
          {errors.personalInfo?.civility && (
            <p className="text-red-500 text-sm mt-1">{errors.personalInfo.civility.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nom</Label>
            <Controller
              name="personalInfo.lastName"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.personalInfo?.lastName ? 'border-red-500' : ''} />
              )}
            />
            {errors.personalInfo?.lastName && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.lastName.message}</p>
            )}
          </div>

          <div>
            <Label>Prénom</Label>
            <Controller
              name="personalInfo.firstName"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.personalInfo?.firstName ? 'border-red-500' : ''} />
              )}
            />
            {errors.personalInfo?.firstName && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.firstName.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Date de naissance</Label>
            <Controller
              name="personalInfo.birthDate"
              control={control}
              render={({ field }) => (
                <Input 
                  type="date" 
                  {...field} 
                  className={errors.personalInfo?.birthDate ? 'border-red-500' : ''} 
                />
              )}
            />
            {errors.personalInfo?.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.birthDate.message}</p>
            )}
          </div>

          <div>
            <Label>Lieu de naissance</Label>
            <Controller
              name="personalInfo.birthPlace"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.personalInfo?.birthPlace ? 'border-red-500' : ''} />
              )}
            />
            {errors.personalInfo?.birthPlace && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.birthPlace.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Email</Label>
            <Controller
              name="personalInfo.email"
              control={control}
              render={({ field }) => (
                <Input 
                  type="email" 
                  {...field} 
                  className={errors.personalInfo?.email ? 'border-red-500' : ''} 
                />
              )}
            />
            {errors.personalInfo?.email && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.email.message}</p>
            )}
          </div>

          <div>
            <Label>Téléphone</Label>
            <Controller
              name="personalInfo.phone"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.personalInfo?.phone ? 'border-red-500' : ''} />
              )}
            />
            {errors.personalInfo?.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.phone.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Adresse</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Numéro</Label>
              <Controller
                name="personalInfo.address.number"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.personalInfo?.address?.number ? 'border-red-500' : ''} />
                )}
              />
              {errors.personalInfo?.address?.number && (
                <p className="text-red-500 text-sm mt-1">{errors.personalInfo.address.number.message}</p>
              )}
            </div>

            <div>
              <Label>Type de voie</Label>
              <Controller
                name="personalInfo.address.streetType"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.personalInfo?.address?.streetType ? 'border-red-500' : ''} />
                )}
              />
              {errors.personalInfo?.address?.streetType && (
                <p className="text-red-500 text-sm mt-1">{errors.personalInfo.address.streetType.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Nom de la voie</Label>
            <Controller
              name="personalInfo.address.street"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.personalInfo?.address?.street ? 'border-red-500' : ''} />
              )}
            />
            {errors.personalInfo?.address?.street && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code postal</Label>
              <Controller
                name="personalInfo.address.postalCode"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.personalInfo?.address?.postalCode ? 'border-red-500' : ''} />
                )}
              />
              {errors.personalInfo?.address?.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.personalInfo.address.postalCode.message}</p>
              )}
            </div>

            <div>
              <Label>Ville</Label>
              <Controller
                name="personalInfo.address.city"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.personalInfo?.address?.city ? 'border-red-500' : ''} />
                )}
              />
              {errors.personalInfo?.address?.city && (
                <p className="text-red-500 text-sm mt-1">{errors.personalInfo.address.city.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Profession</Label>
            <Controller
              name="personalInfo.profession"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.personalInfo?.profession ? 'border-red-500' : ''} />
              )}
            />
            {errors.personalInfo?.profession && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.profession.message}</p>
            )}
          </div>

          <div>
            <Label>Catégorie professionnelle</Label>
            <Controller
              name="personalInfo.professionalCategory"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-2 gap-4 mt-2"
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
            {errors.personalInfo?.professionalCategory && (
              <p className="text-red-500 text-sm mt-1">{errors.personalInfo.professionalCategory.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBankInfoStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Informations bancaires</h2>

      <div className="space-y-4">
        <div>
          <Label>Nom de l'organisme prêteur</Label>
          <Controller
            name="bankInfo.name"
            control={control}
            render={({ field }) => (
              <Input {...field} className={errors.bankInfo?.name ? 'border-red-500' : ''} />
            )}
          />
          {errors.bankInfo?.name && (
            <p className="text-red-500 text-sm mt-1">{errors.bankInfo.name.message}</p>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Adresse de l'agence</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Numéro</Label>
              <Controller
                name="bankInfo.address.number"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.bankInfo?.address?.number ? 'border-red-500' : ''} />
                )}
              />
              {errors.bankInfo?.address?.number && (
                <p className="text-red-500 text-sm mt-1">{errors.bankInfo.address.number.message}</p>
              )}
            </div>

            <div>
              <Label>Type de voie</Label>
              <Controller
                name="bankInfo.address.streetType"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.bankInfo?.address?.streetType ? 'border-red-500' : ''} />
                )}
              />
              {errors.bankInfo?.address?.streetType && (
                <p className="text-red-500 text-sm mt-1">{errors.bankInfo.address.streetType.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Nom de la voie</Label>
            <Controller
              name="bankInfo.address.street"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.bankInfo?.address?.street ? 'border-red-500' : ''} />
              )}
            />
            {errors.bankInfo?.address?.street && (
              <p className="text-red-500 text-sm mt-1">{errors.bankInfo.address.street.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Code postal</Label>
              <Controller
                name="bankInfo.address.postalCode"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.bankInfo?.address?.postalCode ? 'border-red-500' : ''} />
                )}
              />
              {errors.bankInfo?.address?.postalCode && (
                <p className="text-red-500 text-sm mt-1">{errors.bankInfo.address.postalCode.message}</p>
              )}
            </div>

            <div>
              <Label>Ville</Label>
              <Controller
                name="bankInfo.address.city"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.bankInfo?.address?.city ? 'border-red-500' : ''} />
                )}
              />
              {errors.bankInfo?.address?.city && (
                <p className="text-red-500 text-sm mt-1">{errors.bankInfo.address.city.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-medium">Contact à l'agence (facultatif)</h3>
          
          <div>
            <Label>Nom du correspondant</Label>
            <Controller
              name="bankInfo.contact.name"
              control={control}
              render={({ field }) => (
                <Input {...field} className={errors.bankInfo?.contact?.name ? 'border-red-500' : ''} />
              )}
            />
            {errors.bankInfo?.contact?.name && (
              <p className="text-red-500 text-sm mt-1">{errors.bankInfo.contact.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Téléphone</Label>
              <Controller
                name="bankInfo.contact.phone"
                control={control}
                render={({ field }) => (
                  <Input {...field} className={errors.bankInfo?.contact?.phone ? 'border-red-500' : ''} />
                )}
              />
              {errors.bankInfo?.contact?.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.bankInfo.contact.phone.message}</p>
              )}
            </div>

            <div>
              <Label>Email</Label>
              <Controller
                name="bankInfo.contact.email"
                control={control}
                render={({ field }) => (
                  <Input 
                    type="email" 
                    {...field} 
                    className={errors.bankInfo?.contact?.email ? 'border-red-500' : ''} 
                  />
                )}
              />
              {errors.bankInfo?.contact?.email && (
                <p className="text-red-500 text-sm mt-1">{errors.bankInfo.contact.email.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div className="text-xs font-semibold inline-block text-primary">
            {step === 'PERSONAL' ? 'Informations personnelles' : 'Informations bancaires'}
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-primary">
              {step === 'PERSONAL' ? '50%' : '100%'}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary/20">
          <div
            style={{ width: step === 'PERSONAL' ? '50%' : '100%' }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSubmit(onFormSubmit)}>
          {step === 'PERSONAL' ? renderPersonalInfoStep() : renderBankInfoStep()}

          <div className="flex justify-between mt-8">
            {step === 'BANK' && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isLoading}
              >
                Précédent
              </Button>
            )}
            
            <Button
              type={step === 'BANK' ? 'submit' : 'button'}
              onClick={step === 'PERSONAL' ? handleNext : undefined}
              disabled={isLoading}
              className="ml-auto"
            >
              {step === 'PERSONAL' ? 'Suivant' : isLoading ? 'Envoi en cours...' : 'Terminer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}