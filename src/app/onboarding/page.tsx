'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, ChevronLeft, TrendingUp } from 'lucide-react';
import { completeOnboarding } from '@/lib/actions/onboarding';

type Step = 'welcome' | 'connect' | 'preferences' | 'done';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('welcome');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    tillNumber: '',
    lowBalanceThreshold: '5000',
  });

  const handleNext = () => {
    const steps: Step[] = ['welcome', 'connect', 'preferences', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps: Step[] = ['welcome', 'connect', 'preferences', 'done'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1]);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const result = await completeOnboarding({
        businessName: formData.businessName,
        tillNumber: formData.tillNumber || undefined,
        lowBalanceThreshold: parseInt(formData.lowBalanceThreshold) || 5000,
      });

      if (result.success) {
        setStep('done');
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepNumber = () => {
    const stepNumbers: Record<Step, number> = {
      welcome: 0,
      connect: 1,
      preferences: 2,
      done: 3,
    };
    return stepNumbers[step];
  };

  return (
    <div className="flex flex-1 flex-col">
      {/* Header with back button and step indicator */}
      {step !== 'welcome' && step !== 'done' && (
        <header className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-md text-slate-600 transition-colors hover:bg-slate-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <span className="text-sm text-slate-500">
            Step {getStepNumber()} of 2
          </span>
          <div className="w-10" /> {/* Spacer for alignment */}
        </header>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6">
        {step === 'welcome' && (
          <div className="w-full max-w-sm text-center">
            {/* Illustration */}
            <div className="mx-auto mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-emerald-100">
              <TrendingUp className="h-16 w-16 text-emerald-600" />
            </div>

            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              Finally know if you&apos;re making money
            </h1>
            <p className="mb-8 text-slate-600">
              See where your M-Pesa goes. Predict your cash flow. Prove your
              income.
            </p>

            <Button
              onClick={handleNext}
              className="h-12 w-full text-base"
              size="lg"
            >
              Get Started
            </Button>

            <p className="mt-4 text-sm text-slate-500">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/sign-in')}
                className="font-medium text-blue-600"
              >
                Log in
              </button>
            </p>
          </div>
        )}

        {step === 'connect' && (
          <div className="w-full max-w-sm">
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              Connect your M-Pesa Till
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              This lets us show your business transactions automatically. We
              never access your PIN or make any transactions.
            </p>

            <div className="mb-6 space-y-4">
              <div>
                <Label htmlFor="tillNumber">Till Number (Lipa na M-Pesa)</Label>
                <Input
                  id="tillNumber"
                  type="text"
                  placeholder="e.g., 123456"
                  value={formData.tillNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, tillNumber: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-800">
                <strong>Demo mode:</strong> In this version, we&apos;ll show
                sample data for testing. M-Pesa integration coming soon!
              </p>
            </div>

            <Button
              onClick={handleNext}
              className="h-12 w-full text-base"
              size="lg"
            >
              {formData.tillNumber ? 'Connect Till' : 'Continue'}
            </Button>

            <button
              onClick={handleNext}
              className="mt-3 w-full text-center text-sm text-slate-500"
            >
              Skip for now (Use demo data)
            </button>
          </div>
        )}

        {step === 'preferences' && (
          <div className="w-full max-w-sm">
            <h2 className="mb-2 text-xl font-semibold text-slate-900">
              Set up your business
            </h2>
            <p className="mb-6 text-sm text-slate-600">
              Tell us about your business to personalize your experience.
            </p>

            <div className="mb-6 space-y-4">
              <div>
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="e.g., Amina's Fashion"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="mt-1"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  This appears on your reports
                </p>
              </div>

              <div>
                <Label htmlFor="threshold">Low Balance Alert</Label>
                <p className="mb-2 text-xs text-slate-500">
                  Alert me when balance drops below:
                </p>
                <div className="relative">
                  <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-slate-500">
                    KES
                  </span>
                  <Input
                    id="threshold"
                    type="number"
                    value={formData.lowBalanceThreshold}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lowBalanceThreshold: e.target.value,
                      })
                    }
                    className="mt-1 pl-12"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleComplete}
              disabled={!formData.businessName || isSubmitting}
              className="h-12 w-full text-base"
              size="lg"
            >
              {isSubmitting ? 'Setting up...' : 'Finish Setup'}
            </Button>
          </div>
        )}

        {step === 'done' && (
          <div className="w-full max-w-sm text-center">
            {/* Success icon */}
            <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-10 w-10 text-emerald-600" />
            </div>

            <h1 className="mb-3 text-2xl font-bold text-slate-900">
              You&apos;re all set!
            </h1>
            <p className="mb-8 text-slate-600">
              Your dashboard is ready. Start by adding your first transaction or
              explore the demo data.
            </p>

            <Button
              onClick={() => router.push('/')}
              className="h-12 w-full text-base"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
