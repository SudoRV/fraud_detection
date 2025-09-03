export interface Transaction {
  TRANSACTION_ID: string;
  TX_DATETIME: string;
  CUSTOMER_ID: string;
  TERMINAL_ID: string;
  TX_AMOUNT: number;
  TX_TIME_SECONDS: number;
  TX_TIME_DAYS: number;
  TX_FRAUD: number;
  TX_FRAUD_SCENARIO?: number;
  predicted_fraud?: number;
  predicted_probability?: number;
}

export interface FraudStats {
  totalTransactions: number;
  fraudulentTransactions: number;
  fraudRate: number;
  averageAmount: number;
  averageFraudAmount: number;
  scenarioBreakdown: {
    scenario1: number; // Amount > 2200
    scenario2: number; // Terminal fraud
    scenario3: number; // Customer fraud
  };
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusion_matrix: number[][];
}

export interface TerminalStats {
  terminalId: string;
  totalTransactions: number;
  fraudTransactions: number;
  fraudRate: number;
  averageAmount: number;
  suspiciousActivity: boolean;
}

export interface CustomerStats {
  customerId: string;
  totalTransactions: number;
  fraudTransactions: number;
  fraudRate: number;
  averageAmount: number;
  spendingPatternAnomaly: boolean;
  amountVariation: number;
}