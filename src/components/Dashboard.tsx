import React from 'react';
import { FraudStats, ModelMetrics } from '../types/Transaction';
import { AlertTriangle, Shield, TrendingUp, Target, Brain, CheckCircle } from 'lucide-react';

interface DashboardProps {
  fraudStats: FraudStats;
  modelMetrics?: ModelMetrics;
  isModelTrained: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ fraudStats, modelMetrics, isModelTrained }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {/* Total Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Total Transactions</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">
              {fraudStats.totalTransactions.toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Average Amount: ${fraudStats.averageAmount.toFixed(2)}
        </div>
      </div>

      {/* Fraud Rate */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Fraud Rate</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {(fraudStats.fraudRate * 100).toFixed(2)}%
            </p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {fraudStats.fraudulentTransactions.toLocaleString()} fraudulent transactions
        </div>
      </div>

      {/* Model Performance */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">Model Accuracy</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {isModelTrained && modelMetrics ? (modelMetrics.accuracy * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            {isModelTrained ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : (
              <Brain className="w-6 h-6 text-gray-400" />
            )}
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {isModelTrained ? 'Model trained' : 'No model trained yet'}
        </div>
      </div>

      {/* F1 Score */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">F1 Score</h3>
            <p className="text-3xl font-bold text-indigo-600 mt-2">
              {isModelTrained && modelMetrics ? (modelMetrics.f1Score * 100).toFixed(1) : '0.0'}%
            </p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {isModelTrained && modelMetrics 
            ? `Precision: ${(modelMetrics.precision * 100).toFixed(1)}% | Recall: ${(modelMetrics.recall * 100).toFixed(1)}%`
            : 'Train model to see metrics'
          }
        </div>
      </div>

      {/* Fraud Scenarios Breakdown */}
      <div className="col-span-1 lg:col-span-2 xl:col-span-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2 text-blue-600" />
          Fraud Scenarios Analysis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-red-800 mb-2">Scenario 1: High Amount</h4>
            <p className="text-2xl font-bold text-red-600">
              {fraudStats.scenarioBreakdown.scenario1.toLocaleString()}
            </p>
            <p className="text-sm text-red-600 mt-1">Amount &gt; $220</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-800 mb-2">Scenario 2: Terminal Fraud</h4>
            <p className="text-2xl font-bold text-orange-600">
              {fraudStats.scenarioBreakdown.scenario2.toLocaleString()}
            </p>
            <p className="text-sm text-orange-600 mt-1">Compromised terminals</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Scenario 3: Customer Fraud</h4>
            <p className="text-2xl font-bold text-purple-600">
              {fraudStats.scenarioBreakdown.scenario3.toLocaleString()}
            </p>
            <p className="text-sm text-purple-600 mt-1">Card-not-present fraud</p>
          </div>
        </div>
      </div>
    </div>
  );
};