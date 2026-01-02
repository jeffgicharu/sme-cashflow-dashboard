'use client';

import { useState, useTransition, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { Download, Share2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { MonthSelector } from './month-selector';
import { ReportPreview } from './report-preview';
import { ReportPDFDocument } from './report-pdf-document';
import type { MonthOption, ReportData } from '@/lib/db/queries/reports';

interface ReportsContentProps {
  availableMonths: MonthOption[];
  initialData: ReportData | null;
  initialMonth: string;
  onMonthChange: (month: string) => Promise<ReportData>;
}

export function ReportsContent({
  availableMonths,
  initialData,
  initialMonth,
  onMonthChange,
}: ReportsContentProps) {
  const [selectedMonth, setSelectedMonth] = useState(initialMonth);
  const [reportData, setReportData] = useState<ReportData | null>(initialData);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    startTransition(async () => {
      const data = await onMonthChange(month);
      setReportData(data);
    });
  };

  const handleDownload = useCallback(async () => {
    if (!reportData) return;

    setIsDownloading(true);
    try {
      const blob = await pdf(<ReportPDFDocument data={reportData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportData.businessName.replace(/\s+/g, '-')}-${reportData.month}-${reportData.year}-Report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  }, [reportData]);

  const handleShare = useCallback(async () => {
    if (!reportData) return;

    setIsSharing(true);
    try {
      // Generate PDF blob
      const blob = await pdf(<ReportPDFDocument data={reportData} />).toBlob();
      const file = new File(
        [blob],
        `${reportData.businessName.replace(/\s+/g, '-')}-${reportData.month}-${reportData.year}-Report.pdf`,
        { type: 'application/pdf' }
      );

      // Check if Web Share API is available and supports files
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `${reportData.businessName} - ${reportData.month} ${reportData.year} Report`,
          text: `Cash Flow Report for ${reportData.month} ${reportData.year}`,
        });
      } else if (navigator.share) {
        // Fallback to sharing without file (just text)
        await navigator.share({
          title: `${reportData.businessName} - ${reportData.month} ${reportData.year} Report`,
          text: `Cash Flow Report for ${reportData.month} ${reportData.year}\n\nTotal Revenue: KES ${reportData.summary.totalRevenue.toLocaleString()}\nTotal Expenses: KES ${reportData.summary.totalExpenses.toLocaleString()}\nNet Profit: KES ${reportData.summary.netProfit.toLocaleString()}`,
        });
      } else {
        // Fallback to download if share not supported
        await handleDownload();
      }
    } catch (error) {
      // User cancelled share or error occurred
      if ((error as Error).name !== 'AbortError') {
        console.error('Error sharing:', error);
      }
    } finally {
      setIsSharing(false);
    }
  }, [reportData, handleDownload]);

  if (availableMonths.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
          <Download className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="mb-1 text-lg font-semibold text-slate-900">
          No Reports Available
        </h3>
        <p className="max-w-sm text-sm text-slate-500">
          Start adding transactions to generate monthly reports. Once you have
          transaction data, you&apos;ll be able to generate and download PDF
          reports here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium tracking-wide text-slate-500 uppercase">
          Select Month
        </label>
        <MonthSelector
          months={availableMonths}
          selected={selectedMonth}
          onChange={handleMonthChange}
          disabled={isPending}
        />
      </div>

      {/* Report Preview */}
      <div>
        <label className="mb-2 block text-sm font-medium tracking-wide text-slate-500 uppercase">
          Preview
        </label>
        {isPending ? (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : reportData ? (
          <ReportPreview data={reportData} />
        ) : (
          <div className="flex h-[400px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
            No data available for selected month
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {reportData && !isPending && (
        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={handleDownload}
            disabled={isDownloading || isSharing}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isDownloading ? 'Generating PDF...' : 'Download PDF'}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={handleShare}
            disabled={isDownloading || isSharing}
          >
            {isSharing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="mr-2 h-4 w-4" />
            )}
            {isSharing ? 'Preparing...' : 'Share'}
          </Button>
        </div>
      )}
    </div>
  );
}
