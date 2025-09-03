import { Transaction } from '../types/Transaction';

export function parseCSV(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  // Validate headers
  const requiredHeaders = [
    'TRANSACTION_ID',
    'TX_DATETIME',
    'CUSTOMER_ID',
    'TERMINAL_ID',
    'TX_AMOUNT',
    'TX_TIME_SECONDS',
    'TX_TIME_DAYS',
    'TX_FRAUD'
  ];

  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
  }

  const transactions: Transaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length !== headers.length) continue;

    const transaction: Transaction = {} as Transaction;

    headers.forEach((header, index) => {
      const value = values[index]?.trim();
      
      switch (header) {
        case 'TRANSACTION_ID':
          transaction.TRANSACTION_ID = value;
          break;
        case 'TX_DATETIME':
          transaction.TX_DATETIME = value;
          break;
        case 'CUSTOMER_ID':
          transaction.CUSTOMER_ID = value;
          break;
        case 'TERMINAL_ID':
          transaction.TERMINAL_ID = value;
          break;
        case 'TX_AMOUNT':
          transaction.TX_AMOUNT = parseFloat(value) || 0;
          break;
        case 'TX_TIME_SECONDS':
          transaction.TX_TIME_SECONDS = parseInt(value) || 0;
          break;
        case 'TX_TIME_DAYS':
          transaction.TX_TIME_DAYS = parseInt(value) || 0;
          break;
        case 'TX_FRAUD':
          transaction.TX_FRAUD = parseInt(value) || 0;
          break;
        case 'TX_FRAUD_SCENARIO':
          transaction.TX_FRAUD_SCENARIO = parseInt(value) || undefined;
          break;
      }
    });

    if (transaction.TRANSACTION_ID && transaction.CUSTOMER_ID && transaction.TERMINAL_ID) {
      transactions.push(transaction);
    }
  }

  return transactions;
}

export function exportToCSV(transactions: Transaction[], filename: string = 'fraud_detection_results.csv'): void {
  const headers = [
    'TRANSACTION_ID',
    'TX_DATETIME',
    'CUSTOMER_ID',
    'TERMINAL_ID',
    'TX_AMOUNT',
    'TX_FRAUD',
    'TX_FRAUD_SCENARIO',
    'PREDICTED_FRAUD',
    'PREDICTED_PROBABILITY'
  ];

  const csvContent = [
    headers.join(','),
    ...transactions.map(t => [
      t.TRANSACTION_ID,
      t.TX_DATETIME,
      t.CUSTOMER_ID,
      t.TERMINAL_ID,
      t.TX_AMOUNT,
      t.TX_FRAUD,
      t.TX_FRAUD_SCENARIO || '',
      t.predicted_fraud || '',
      t.predicted_probability ? t.predicted_probability.toFixed(4) : ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}