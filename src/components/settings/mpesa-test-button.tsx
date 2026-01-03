'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, TestTube } from 'lucide-react';
import { toast } from 'sonner';

export function MpesaTestButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('100');
  const [phoneNumber, setPhoneNumber] = useState('254708374149');
  const [reference, setReference] = useState('Test');

  const handleSimulate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/mpesa/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          phoneNumber,
          billRefNumber: reference,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('C2B payment simulated successfully');
        setIsOpen(false);
      } else {
        toast.error(result.error || result.message || 'Simulation failed');
      }
    } catch (error) {
      toast.error('Failed to simulate payment');
      console.error('Simulation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <TestTube className="mr-2 h-4 w-4" />
          Test M-Pesa Simulation
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Simulate C2B Payment</DialogTitle>
          <DialogDescription>
            Test M-Pesa integration by simulating a customer payment (sandbox
            only)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="amount">Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="254708374149"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-slate-500">
              Use format 254XXXXXXXXX (Safaricom test number: 254708374149)
            </p>
          </div>
          <div>
            <Label htmlFor="reference">Bill Reference</Label>
            <Input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Test"
              className="mt-1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSimulate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Simulating...
              </>
            ) : (
              'Simulate Payment'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
