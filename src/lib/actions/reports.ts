'use server';

import { auth } from '@clerk/nextjs/server';
import { getReportData } from '@/lib/db/queries/reports';
import type { ReportData } from '@/lib/db/queries/reports';

export async function getReportDataAction(month: string): Promise<ReportData> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return getReportData(userId, month);
}
