'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { ReportData } from '@/lib/db/queries/reports';

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#FFFFFF',
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  businessName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 2,
  },
  period: {
    fontSize: 12,
    color: '#64748B',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  summaryLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
  },
  revenueValue: {
    color: '#16A34A',
  },
  expenseValue: {
    color: '#DC2626',
  },
  profitValue: {
    color: '#0F172A',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: '#475569',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  tableCell: {
    fontSize: 10,
    color: '#0F172A',
  },
  categoryCol: {
    width: '40%',
  },
  amountCol: {
    width: '25%',
    textAlign: 'right',
  },
  percentCol: {
    width: '15%',
    textAlign: 'right',
  },
  countCol: {
    width: '20%',
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  statBox: {
    width: '50%',
    padding: 8,
  },
  statLabel: {
    fontSize: 9,
    color: '#64748B',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 9,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  colorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryName: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

function formatCurrency(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE')}`;
}

interface ReportPDFDocumentProps {
  data: ReportData;
}

export function ReportPDFDocument({ data }: ReportPDFDocumentProps) {
  const { businessName, month, year, summary, categoryBreakdown, generatedAt } =
    data;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.businessName}>{businessName}</Text>
          <Text style={styles.reportTitle}>Cash Flow Report</Text>
          <Text style={styles.period}>
            {month} {year}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
              <Text style={[styles.summaryValue, styles.revenueValue]}>
                {formatCurrency(summary.totalRevenue)}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Total Expenses</Text>
              <Text style={[styles.summaryValue, styles.expenseValue]}>
                {formatCurrency(summary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLabel}>Net Profit</Text>
              <Text
                style={[
                  styles.summaryValue,
                  summary.netProfit >= 0
                    ? styles.revenueValue
                    : styles.expenseValue,
                ]}
              >
                {formatCurrency(summary.netProfit)}
              </Text>
            </View>
          </View>
        </View>

        {/* Category Breakdown Section */}
        {categoryBreakdown.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Expenses by Category</Text>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, styles.categoryCol]}>
                  Category
                </Text>
                <Text style={[styles.tableHeaderCell, styles.amountCol]}>
                  Amount
                </Text>
                <Text style={[styles.tableHeaderCell, styles.percentCol]}>
                  %
                </Text>
                <Text style={[styles.tableHeaderCell, styles.countCol]}>
                  Transactions
                </Text>
              </View>
              {categoryBreakdown.map((category) => (
                <View key={category.categoryId} style={styles.tableRow}>
                  <View style={[styles.categoryCol, styles.categoryName]}>
                    <View
                      style={[
                        styles.colorDot,
                        { backgroundColor: category.categoryColor },
                      ]}
                    />
                    <Text style={styles.tableCell}>
                      {category.categoryName}
                    </Text>
                  </View>
                  <Text style={[styles.tableCell, styles.amountCol]}>
                    {formatCurrency(category.amount)}
                  </Text>
                  <Text style={[styles.tableCell, styles.percentCol]}>
                    {category.percentage}%
                  </Text>
                  <Text style={[styles.tableCell, styles.countCol]}>
                    {category.count}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Transaction Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Transactions</Text>
              <Text style={styles.statValue}>{summary.transactionCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Income Transactions</Text>
              <Text style={styles.statValue}>{summary.incomeCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Expense Transactions</Text>
              <Text style={styles.statValue}>{summary.expenseCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Average Transaction Size</Text>
              <Text style={styles.statValue}>
                {formatCurrency(summary.avgTransactionSize)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated on{' '}
            {generatedAt.toLocaleDateString('en-KE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}{' '}
            | SME Cash Flow Dashboard
          </Text>
        </View>
      </Page>
    </Document>
  );
}
