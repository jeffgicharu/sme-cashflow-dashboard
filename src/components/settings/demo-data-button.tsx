'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Database, Loader2 } from 'lucide-react';
import { loadDemoData } from '@/lib/actions/settings';
import { toast } from 'sonner';

export function DemoDataButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadDemoData = async () => {
    setIsLoading(true);
    try {
      const result = await loadDemoData();
      if (result.success) {
        toast.success(`Loaded ${result.count} demo transactions`);
      } else {
        toast.error(result.error || 'Failed to load demo data');
      }
    } catch {
      toast.error('Failed to load demo data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleLoadDemoData}
      disabled={isLoading}
      className="w-full justify-start"
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Database className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Loading...' : 'Load Demo Transactions'}
    </Button>
  );
}
