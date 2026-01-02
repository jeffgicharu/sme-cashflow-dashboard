import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <SignIn
      appearance={{
        elements: {
          formButtonPrimary:
            'bg-slate-900 hover:bg-slate-800 text-sm font-medium',
          card: 'shadow-none',
          headerTitle: 'hidden',
          headerSubtitle: 'hidden',
          socialButtonsBlockButton:
            'border-slate-300 hover:bg-slate-50 text-slate-900',
          formFieldInput:
            'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20',
          footerActionLink: 'text-blue-600 hover:text-blue-700',
        },
      }}
    />
  );
}
