import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { simulateC2BPayment, isMpesaConfigured } from '@/lib/mpesa/client';

/**
 * POST /api/mpesa/simulate
 * Simulate a C2B payment (sandbox only)
 * Used for testing M-Pesa integration
 */
export async function POST(request: Request) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if M-Pesa is configured
    if (!isMpesaConfigured()) {
      return NextResponse.json(
        { error: 'M-Pesa is not configured' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { amount, phoneNumber, billRefNumber } = body;

    // Validate required fields
    if (!amount || !phoneNumber) {
      return NextResponse.json(
        { error: 'Amount and phone number are required' },
        { status: 400 }
      );
    }

    // Simulate the payment
    const result = await simulateC2BPayment(
      amount,
      phoneNumber,
      billRefNumber || 'Test'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('M-Pesa simulation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Simulation failed' },
      { status: 500 }
    );
  }
}
