import { Transaction, FraudStats, TerminalStats, CustomerStats } from '../types/Transaction';

export class DataAnalyzer {
  static analyzeFraudStats(transactions: Transaction[]): FraudStats {
    const totalTransactions = transactions.length;
    const fraudulentTransactions = transactions.filter(t => t.TX_FRAUD === 1).length;
    const fraudRate = fraudulentTransactions / totalTransactions;

    const amounts = transactions.map(t => t.TX_AMOUNT);
    const fraudAmounts = transactions.filter(t => t.TX_FRAUD === 1).map(t => t.TX_AMOUNT);

    const averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const averageFraudAmount = fraudAmounts.length > 0 
      ? fraudAmounts.reduce((a, b) => a + b, 0) / fraudAmounts.length 
      : 0;

    // Count fraud scenarios
    const scenario1 = transactions.filter(t => t.TX_FRAUD === 1 && t.TX_FRAUD_SCENARIO === 1).length;
    const scenario2 = transactions.filter(t => t.TX_FRAUD === 1 && t.TX_FRAUD_SCENARIO === 2).length;
    const scenario3 = transactions.filter(t => t.TX_FRAUD === 1 && t.TX_FRAUD_SCENARIO === 3).length;

    return {
      totalTransactions,
      fraudulentTransactions,
      fraudRate,
      averageAmount,
      averageFraudAmount,
      scenarioBreakdown: {
        scenario1,
        scenario2,
        scenario3
      }
    };
  }

  static analyzeTerminalStats(transactions: Transaction[]): TerminalStats[] {
    const terminalGroups = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.TERMINAL_ID]) {
        acc[transaction.TERMINAL_ID] = [];
      }
      acc[transaction.TERMINAL_ID].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    return Object.entries(terminalGroups).map(([terminalId, terminalTransactions]) => {
      const totalTransactions = terminalTransactions.length;
      const fraudTransactions = terminalTransactions.filter(t => t.TX_FRAUD === 1).length;
      const fraudRate = fraudTransactions / totalTransactions;
      
      const amounts = terminalTransactions.map(t => t.TX_AMOUNT);
      const averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;

      return {
        terminalId,
        totalTransactions,
        fraudTransactions,
        fraudRate,
        averageAmount,
        suspiciousActivity: fraudRate > 0.3 // Flag terminals with >30% fraud rate
      };
    }).sort((a, b) => b.fraudRate - a.fraudRate);
  }

  static analyzeCustomerStats(transactions: Transaction[]): CustomerStats[] {
    const customerGroups = transactions.reduce((acc, transaction) => {
      if (!acc[transaction.CUSTOMER_ID]) {
        acc[transaction.CUSTOMER_ID] = [];
      }
      acc[transaction.CUSTOMER_ID].push(transaction);
      return acc;
    }, {} as Record<string, Transaction[]>);

    return Object.entries(customerGroups).map(([customerId, customerTransactions]) => {
      const totalTransactions = customerTransactions.length;
      const fraudTransactions = customerTransactions.filter(t => t.TX_FRAUD === 1).length;
      const fraudRate = fraudTransactions / totalTransactions;
      
      const amounts = customerTransactions.map(t => t.TX_AMOUNT);
      const averageAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      
      // Calculate amount variation (standard deviation)
      const amountVariation = Math.sqrt(
        amounts.reduce((sum, amount) => sum + Math.pow(amount - averageAmount, 2), 0) / amounts.length
      );

      return {
        customerId,
        totalTransactions,
        fraudTransactions,
        fraudRate,
        averageAmount,
        amountVariation,
        spendingPatternAnomaly: amountVariation > averageAmount * 2 // Flag high variation
      };
    }).sort((a, b) => b.fraudRate - a.fraudRate);
  }

  static getTransactionsByTimeRange(transactions: Transaction[], startDay: number, endDay: number): Transaction[] {
    return transactions.filter(t => t.TX_TIME_DAYS >= startDay && t.TX_TIME_DAYS <= endDay);
  }

  static detectAnomalies(transactions: Transaction[]): Transaction[] {
    const customerStats = this.analyzeCustomerStats(transactions);
    const terminalStats = this.analyzeTerminalStats(transactions);

    const customerMap = new Map(customerStats.map(cs => [cs.customerId, cs]));
    const terminalMap = new Map(terminalStats.map(ts => [ts.terminalId, ts]));

    return transactions.filter(transaction => {
      const customer = customerMap.get(transaction.CUSTOMER_ID);
      const terminal = terminalMap.get(transaction.TERMINAL_ID);

      // Anomaly conditions
      const highAmountAnomaly = transaction.TX_AMOUNT > 220;
      const terminalAnomaly = terminal && terminal.suspiciousActivity;
      const customerAnomaly = customer && customer.spendingPatternAnomaly;
      const amountSpike = customer && transaction.TX_AMOUNT > customer.averageAmount * 3;

      return highAmountAnomaly || terminalAnomaly || customerAnomaly || amountSpike;
    });
  }
}