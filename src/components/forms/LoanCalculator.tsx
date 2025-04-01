import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertWithIcon } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/format';
import { Calculator, Send } from 'lucide-react';
import { useAFISimulation, type SimulationFormData } from '@/lib/afi-esca/hooks/useAFISimulation';

const formSchema = z.object({
  loan_amount: z.string()
    .transform((val) => parseFloat(val))
    .refine((val) => val >= 10000, 'Le montant minimum est de 10 000 €')
    .refine((val) => val <= 1000000, 'Le montant maximum est de 1 000 000 €'),
  loan_duration: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => val >= 12, 'Durée minimum : 12 mois')
    .refine((val) => val <= 360, 'Durée maximum : 360 mois'),
  loan_rate: z.string()
    .transform((val) => parseFloat(val))
    .refine((val) => val > 0, 'Taux supérieur à 0')
    .refine((val) => val <= 20, 'Taux maximum : 20%'),
  coverage_type: z.enum(['DEATH', 'DISABILITY', 'BOTH']),
});

type LoanFormData = z.infer<typeof formSchema>;

interface LoanCalculatorProps {
  onCalculate: (data: LoanFormData) => void;
  isLoading?: boolean;
}

export function LoanCalculator({ onCalculate, isLoading = false }: LoanCalculatorProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoanFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      loan_amount: '100000',
      loan_duration: '240',
      loan_rate: '3.5',
      coverage_type: 'BOTH',
    },
  });

  const { simulate, isLoading: isSimulating } = useAFISimulation();
  const values = watch();

  const monthlyPayment = useMemo(() => {
    const amount = parseFloat(values.loan_amount || '0');
    const duration = parseInt(values.loan_duration || '0');
    const rate = parseFloat(values.loan_rate || '0') / 100 / 12;

    if (!amount || !duration || !rate) return 0;

    const monthly = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
    return isFinite(monthly) ? monthly : 0;
  }, [values]);

  const totalCost = useMemo(() => {
    const duration = parseInt(values.loan_duration || '0');
    const amount = parseFloat(values.loan_amount || '0');
    return monthlyPayment * duration - amount;
  }, [monthlyPayment, values]);

  const handleFormSubmit = async (data: LoanFormData) => {
    try {
      // Map form data to AFI ESCA format
      const simulationData: SimulationFormData = {
        loan: {
          amount: data.loan_amount,
          duration: data.loan_duration,
          rate: data.loan_rate,
          type: 'MORTGAGE'
        },
        insured: {
          gender: 'HOMME',
          birthDate: '1990-01-01', // This should come from the user profile
          profession: 'Employé',
          professionalCategory: 'EMPLOYEE',
          smoker: false
        },
        coverage: {
          death: data.coverage_type === 'DEATH' || data.coverage_type === 'BOTH',
          ptia: false,
          ipt: data.coverage_type === 'DISABILITY' || data.coverage_type === 'BOTH',
          itt: data.coverage_type === 'DISABILITY' || data.coverage_type === 'BOTH',
          ipp: false,
          quotity: 100
        }
      };

      const result = await simulate(simulationData);
      onCalculate({
        ...data,
        monthly_payment: result.Primes[0].Montant
      });
    } catch (error) {
      console.error('Error during simulation:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <AlertWithIcon
        variant="info"
        icon={Calculator}
        title="Simulateur de prêt"
        description="Calculez vos mensualités et le coût total de votre assurance emprunteur en quelques clics."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Field
          id="loan_amount"
          label="Montant du prêt (€)"
          error={errors.loan_amount?.message}
          register={register("loan_amount")}
          disabled={isLoading || isSimulating}
        />
        <Field
          id="loan_duration"
          label="Durée (mois)"
          error={errors.loan_duration?.message}
          register={register("loan_duration")}
          disabled={isLoading || isSimulating}
        />
        <Field
          id="loan_rate"
          label="Taux annuel (%)"
          error={errors.loan_rate?.message}
          register={register("loan_rate")}
          disabled={isLoading || isSimulating}
        />

        <div className="space-y-2">
          <Label htmlFor="coverage_type">Type de couverture</Label>
          <select
            id="coverage_type"
            {...register('coverage_type')}
            disabled={isLoading || isSimulating}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="DEATH">Décès uniquement</option>
            <option value="DISABILITY">Invalidité uniquement</option>
            <option value="BOTH">Décès + Invalidité</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryItem label="Mensualité estimée" value={formatCurrency(monthlyPayment)} />
          <SummaryItem label="Coût total des intérêts" value={formatCurrency(totalCost)} />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isLoading || isSimulating}>
          {isLoading || isSimulating ? (
            <>
              <Calculator className="h-4 w-4 mr-2 animate-spin" />
              Calcul...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Continuer
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  id,
  label,
  register,
  error,
  disabled
}: {
  id: string;
  label: string;
  register: any;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        step="any"
        disabled={disabled}
        {...register}
        className={error ? 'border-red-500' : ''}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}