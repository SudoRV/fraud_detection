import * as tf from '@tensorflow/tfjs';
import { Transaction, ModelMetrics } from '../types/Transaction';

export class FraudDetector {
  private model: tf.Sequential | null = null;
  private scaler: { mean: number[]; std: number[] } | null = null;
  private isTraining = false;

  // Feature engineering for fraud detection
  private extractFeatures(transactions: Transaction[]): number[][] {
    // Calculate customer and terminal statistics for each transaction
    const customerStats = this.calculateCustomerStats(transactions);
    const terminalStats = this.calculateTerminalStats(transactions);

    return transactions.map(transaction => {
      const customerStat = customerStats.get(transaction.CUSTOMER_ID);
      const terminalStat = terminalStats.get(transaction.TERMINAL_ID);
      
      return [
        transaction.TX_AMOUNT,
        transaction.TX_TIME_SECONDS,
        transaction.TX_TIME_DAYS,
        customerStat?.avgAmount || 0,
        customerStat?.transactionCount || 0,
        customerStat?.amountVariation || 0,
        terminalStat?.avgAmount || 0,
        terminalStat?.transactionCount || 0,
        terminalStat?.fraudRate || 0,
        // Amount anomaly detection (compared to customer's average)
        Math.abs(transaction.TX_AMOUNT - (customerStat?.avgAmount || 0)),
        // Time-based features
        Math.sin(2 * Math.PI * (transaction.TX_TIME_SECONDS % 86400) / 86400), // Time of day pattern
        Math.cos(2 * Math.PI * (transaction.TX_TIME_SECONDS % 86400) / 86400),
        Math.sin(2 * Math.PI * (transaction.TX_TIME_DAYS % 7) / 7), // Day of week pattern
        Math.cos(2 * Math.PI * (transaction.TX_TIME_DAYS % 7) / 7),
      ];
    });
  }

  private calculateCustomerStats(transactions: Transaction[]): Map<string, any> {
    const customerStats = new Map();
    
    // Group by customer
    const customerGroups = transactions.reduce((acc, t) => {
      if (!acc[t.CUSTOMER_ID]) acc[t.CUSTOMER_ID] = [];
      acc[t.CUSTOMER_ID].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    // Calculate stats for each customer
    Object.entries(customerGroups).forEach(([customerId, customerTransactions]) => {
      const amounts = customerTransactions.map(t => t.TX_AMOUNT);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const amountVariation = Math.sqrt(
        amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length
      );
      
      customerStats.set(customerId, {
        avgAmount,
        transactionCount: customerTransactions.length,
        amountVariation,
      });
    });

    return customerStats;
  }

  private calculateTerminalStats(transactions: Transaction[]): Map<string, any> {
    const terminalStats = new Map();
    
    // Group by terminal
    const terminalGroups = transactions.reduce((acc, t) => {
      if (!acc[t.TERMINAL_ID]) acc[t.TERMINAL_ID] = [];
      acc[t.TERMINAL_ID].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    // Calculate stats for each terminal
    Object.entries(terminalGroups).forEach(([terminalId, terminalTransactions]) => {
      const amounts = terminalTransactions.map(t => t.TX_AMOUNT);
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const fraudCount = terminalTransactions.filter(t => t.TX_FRAUD === 1).length;
      const fraudRate = fraudCount / terminalTransactions.length;
      
      terminalStats.set(terminalId, {
        avgAmount,
        transactionCount: terminalTransactions.length,
        fraudRate,
      });
    });

    return terminalStats;
  }

  private normalizeFeatures(features: number[][]): number[][] {
    if (!features.length) return features;

    const numFeatures = features[0].length;
    const means = new Array(numFeatures).fill(0);
    const stds = new Array(numFeatures).fill(1);

    // Calculate means
    for (let i = 0; i < numFeatures; i++) {
      means[i] = features.reduce((sum, row) => sum + row[i], 0) / features.length;
    }

    // Calculate standard deviations
    for (let i = 0; i < numFeatures; i++) {
      const variance = features.reduce((sum, row) => sum + Math.pow(row[i] - means[i], 2), 0) / features.length;
      stds[i] = Math.sqrt(variance) || 1; // Avoid division by zero
    }

    this.scaler = { mean: means, std: stds };

    // Normalize features
    return features.map(row => 
      row.map((value, i) => (value - means[i]) / stds[i])
    );
  }

  private applyNormalization(features: number[][]): number[][] {
    if (!this.scaler) return features;
    
    return features.map(row => 
      row.map((value, i) => (value - this.scaler!.mean[i]) / this.scaler!.std[i])
    );
  }

  async trainModel(transactions: Transaction[]): Promise<ModelMetrics> {
    this.isTraining = true;

    try {
      // Extract features and labels
      const features = this.extractFeatures(transactions);
      const normalizedFeatures = this.normalizeFeatures(features);
      const labels = transactions.map(t => t.TX_FRAUD);

      // Convert to tensors
      const X = tf.tensor2d(normalizedFeatures);
      const y = tf.tensor2d(labels, [labels.length, 1]);

      // Build neural network model
      this.model = tf.sequential({
        layers: [
          tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [normalizedFeatures[0].length],
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: 0.3 }),
          tf.layers.dense({
            units: 32,
            activation: 'relu',
            kernelRegularizer: tf.regularizers.l2({ l2: 0.01 })
          }),
          tf.layers.dropout({ rate: 0.2 }),
          tf.layers.dense({
            units: 16,
            activation: 'relu'
          }),
          tf.layers.dense({
            units: 1,
            activation: 'sigmoid'
          })
        ]
      });

      // Compile model
      this.model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
      });

      // Train model
      await this.model.fit(X, y, {
        epochs: 10,
        batchSize: 32,
        validationSplit: 0.2,
        verbose: 0,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (epoch % 10 === 0) {
              console.log(`Epoch ${epoch}: loss = ${logs?.loss?.toFixed(4)}, accuracy = ${logs?.acc?.toFixed(4)}`);
            }
          }
        }
      });

      // Calculate metrics
      const predictions = await this.predict(transactions);
      const metrics = this.calculateMetrics(transactions, predictions);

      // Clean up tensors
      X.dispose();
      y.dispose();

      this.isTraining = false;
      return metrics;
    } catch (error) {
      this.isTraining = false;
      throw error;
    }
  }

  async predict(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.model || !this.scaler) {
      throw new Error('Model not trained yet');
    }

    const features = this.extractFeatures(transactions);
    const normalizedFeatures = this.applyNormalization(features);
    
    const X = tf.tensor2d(normalizedFeatures);
    const predictions = this.model.predict(X) as tf.Tensor;
    const probabilities = await predictions.data();

    // Clean up tensors
    X.dispose();
    predictions.dispose();

    return transactions.map((transaction, index) => ({
      ...transaction,
      predicted_fraud: probabilities[index] > 0.5 ? 1 : 0,
      predicted_probability: probabilities[index],
    }));
  }

  private calculateMetrics(actual: Transaction[], predicted: Transaction[]): ModelMetrics {
    let tp = 0, fp = 0, tn = 0, fn = 0;

    for (let i = 0; i < actual.length; i++) {
      const actualLabel = actual[i].TX_FRAUD;
      const predictedLabel = predicted[i].predicted_fraud || 0;

      if (actualLabel === 1 && predictedLabel === 1) tp++;
      else if (actualLabel === 0 && predictedLabel === 1) fp++;
      else if (actualLabel === 0 && predictedLabel === 0) tn++;
      else if (actualLabel === 1 && predictedLabel === 0) fn++;
    }

    const accuracy = (tp + tn) / (tp + fp + tn + fn);
    const precision = tp / (tp + fp) || 0;
    const recall = tp / (tp + fn) || 0;
    const f1Score = 2 * (precision * recall) / (precision + recall) || 0;

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      confusion_matrix: [[tn, fp], [fn, tp]]
    };
  }

  // Rule-based detection for comparison
  detectFraudRuleBased(transactions: Transaction[]): Transaction[] {
    const customerStats = this.calculateCustomerStats(transactions);
    const terminalStats = this.calculateTerminalStats(transactions);

    return transactions.map(transaction => {
      let predictedFraud = 0;
      let predictedScenario = 0;

      // Scenario 1: Amount > 220
      if (transaction.TX_AMOUNT > 220) {
        predictedFraud = 1;
        predictedScenario = 1;
      }
      // Scenario 2: High fraud rate terminal (> 50%)
      else {
        const terminalStat = terminalStats.get(transaction.TERMINAL_ID);
        if (terminalStat && terminalStat.fraudRate > 0.5) {
          predictedFraud = 1;
          predictedScenario = 2;
        }
        // Scenario 3: Amount significantly higher than customer's average
        else {
          const customerStat = customerStats.get(transaction.CUSTOMER_ID);
          if (customerStat && transaction.TX_AMOUNT > customerStat.avgAmount * 3) {
            predictedFraud = 1;
            predictedScenario = 3;
          }
        }
      }

      return {
        ...transaction,
        predicted_fraud: predictedFraud,
        predicted_scenario: predictedScenario,
        predicted_probability: predictedFraud
      };
    });
  }

  isTrainingInProgress(): boolean {
    return this.isTraining;
  }
}