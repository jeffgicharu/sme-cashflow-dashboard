import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSettings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import {
  parseC2BCallback,
  validateCallback,
  type C2BCallbackData,
} from '@/lib/mpesa/client';
import { addMpesaTransaction } from '@/lib/actions/transactions';

/**
 * M-Pesa C2B Validation URL
 * Called by M-Pesa before processing a payment
 * Return success to allow the transaction, or error to reject
 */
export async function GET() {
  // Validation endpoint - return success to accept all transactions
  // In production, you could add validation logic here
  return NextResponse.json({
    ResultCode: 0,
    ResultDesc: 'Accepted',
  });
}

/**
 * M-Pesa C2B Confirmation URL
 * Called by M-Pesa after a successful payment
 * This is where we create the transaction record
 */
export async function POST(request: NextRequest) {
  try {
    // Validate the callback
    if (!validateCallback(request.headers)) {
      console.error('Invalid M-Pesa callback headers');
      return NextResponse.json(
        { ResultCode: 1, ResultDesc: 'Invalid request' },
        { status: 400 }
      );
    }

    // Parse the callback body
    const body = (await request.json()) as C2BCallbackData;

    // Parse the callback data
    const parsedData = parseC2BCallback(body);

    // Find the user associated with this shortcode
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.tillNumber, parsedData.shortcode),
    });

    if (!settings) {
      console.error(`No user found for shortcode: ${parsedData.shortcode}`);
      // Still return success to M-Pesa so they don't retry
      return NextResponse.json({
        ResultCode: 0,
        ResultDesc: 'Accepted',
      });
    }

    // Create the transaction
    const result = await addMpesaTransaction({
      userId: settings.userId,
      amount: parsedData.amount,
      type: 'income', // C2B payments are always income
      senderName: parsedData.senderName,
      senderPhone: parsedData.senderPhone,
      reference: parsedData.reference || parsedData.transactionId,
      date: parsedData.date,
    });

    if (!result.success) {
      console.error('Failed to create transaction:', result.error);
    }

    // Always return success to M-Pesa
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  } catch (error) {
    console.error('M-Pesa webhook error:', error);
    // Still return success to prevent M-Pesa from retrying
    return NextResponse.json({
      ResultCode: 0,
      ResultDesc: 'Accepted',
    });
  }
}
