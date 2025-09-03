import React from 'react';
import { Transaction, TerminalStats, CustomerStats } from '../types/Transaction';
import { BarChart, Users, Monitor, TrendingUp, AlertCircle } from 'lucide-react';

interface AnalyticsProps {
  transactions: Transaction[];
  terminalStats: TerminalStats[];
  customerStats: CustomerStats[];
}

export const Analytics: React.FC<AnalyticsProps> = ({
  transactions,
  terminalStats,
  customerStats,
}) => {
  // Amount distribution analysis
  const amountRanges = [
    { label: '$0 - $50', min: 0, max: 50, color: 'bg-green-500' },
    { label: '$50 - $100', min: 50, max: 100, color: 'bg-blue-500' },
    { label: '$100 - $150', min: 100, max: 150, color: 'bg-yellow-500' },
    { label: '$150 - $220', min: 150, max: 220, color: 'bg-orange-500' },
    { label: '$220+', min: 220, max: Infinity, color: 'bg-red-500' },
  ];

  const amountDistribution = amountRanges.map(range => {
    const transactionsInRange = transactions.filter(t => 
      t.TX_AMOUNT >= range.min && t.TX_AMOUNT < range.max
    );
    const fraudInRange = transactionsInRange.filter(t => t.TX_FRAUD === 1);
    
    return {
      ...range,
      total: transactionsInRange.length,
      fraud: fraudInRange.length,
      fraudRate: transactionsInRange.length > 0 ? fraudInRange.length / transactionsInRange.length : 0
    };
  });

  // Top risky terminals
  const riskyTerminals = terminalStats
    .filter(ts => ts.suspiciousActivity)
    .slice(0, 5);

  // Top risky customers
  const riskyCustomers = customerStats
    .filter(cs => cs.spendingPatternAnomaly || cs.fraudRate > 0.1)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Amount Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <BarChart className="w-5 h-5 mr-2 text-blue-600" />
          Transaction Amount Distribution & Fraud Rates
        </h3>
        
        <div className="space-y-4">
          {amountDistribution.map((range, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{range.label}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">{range.total} transactions</span>
                  <span className={`text-sm font-medium ${
                    range.fraudRate > 0.5 ? 'text-red-600' : 
                    range.fraudRate > 0.1 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {(range.fraudRate * 100).toFixed(1)}% fraud
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${range.color} transition-all duration-300`}
                  style={{ 
                    width: `${Math.min(100, (range.total / Math.max(...amountDistribution.map(r => r.total))) * 100)}%` 
                  }}
                ></div>
              </div>
              {range.fraud > 0 && (
                <div className="absolute top-8 bg-red-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min(100, (range.fraud / Math.max(...amountDistribution.map(r => r.total))) * 100)}%` 
                  }}
                ></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Terminal Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Monitor className="w-5 h-5 mr-2 text-orange-600" />
          High-Risk Terminals
        </h3>
        
        {riskyTerminals.length > 0 ? (
          <div className="space-y-3">
            {riskyTerminals.map((terminal) => (
              <div key={terminal.terminalId} className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div>
                  <div className="font-medium text-gray-800">Terminal {terminal.terminalId}</div>
                  <div className="text-sm text-gray-600">
                    {terminal.totalTransactions} transactions | Avg: ${terminal.averageAmount.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-orange-600">
                    {(terminal.fraudRate * 100).toFixed(1)}% fraud rate
                  </div>
                  <div className="text-sm text-orange-600">
                    {terminal.fraudTransactions} fraudulent
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Monitor className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No high-risk terminals detected</p>
          </div>
        )}
      </div>

      {/* Customer Analysis */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <Users className="w-5 h-5 mr-2 text-purple-600" />
          High-Risk Customers
        </h3>
        
        {riskyCustomers.length > 0 ? (
          <div className="space-y-3">
            {riskyCustomers.map((customer) => (
              <div key={customer.customerId} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div>
                  <div className="font-medium text-gray-800">Customer {customer.customerId}</div>
                  <div className="text-sm text-gray-600">
                    {customer.totalTransactions} transactions | Avg: ${customer.averageAmount.toFixed(2)}
                  </div>
                  <div className="text-sm text-purple-600">
                    Amount variation: ±${customer.amountVariation.toFixed(2)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-purple-600">
                    {(customer.fraudRate * 100).toFixed(1)}% fraud rate
                  </div>
                  <div className="text-sm text-purple-600">
                    {customer.fraudTransactions} fraudulent
                  </div>
                  {customer.spendingPatternAnomaly && (
                    <div className="flex items-center mt-1">
                      <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                      <span className="text-xs text-red-600">Anomalous pattern</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No high-risk customers detected</p>
          </div>
        )}
      </div>

      {/* Fraud Timeline */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
          Fraud Timeline Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(scenario => {
            const scenarioTransactions = transactions.filter(t => t.TX_FRAUD_SCENARIO === scenario);
            const scenarioName = scenario === 1 ? 'High Amount' : scenario === 2 ? 'Terminal Fraud' : 'Customer Fraud';
            
            const scenarioStyles = scenario === 1 
              ? {
                  bg: 'bg-red-50',
                  border: 'border-red-200',
                  textHeader: 'text-red-800',
                  textValue: 'text-red-600'
                }
              : scenario === 2
              ? {
                  bg: 'bg-orange-50',
                  border: 'border-orange-200',
                  textHeader: 'text-orange-800',
                  textValue: 'text-orange-600'
                }
              : {
                  bg: 'bg-purple-50',
                  border: 'border-purple-200',
                  textHeader: 'text-purple-800',
                  textValue: 'text-purple-600'
                };
            
            return (
              <div key={scenario} className={`${scenarioStyles.bg} rounded-lg p-4 border ${scenarioStyles.border}`}>
                <h4 className={`font-medium ${scenarioStyles.textHeader} mb-2`}>Scenario {scenario}: {scenarioName}</h4>
                <p className={`text-2xl font-bold ${scenarioStyles.textValue}`}>
                  {scenarioTransactions.length.toLocaleString()}
                </p>
                <p className={`text-sm ${scenarioStyles.textValue} mt-1`}>
                  {scenarioTransactions.length > 0 
                    ? `Avg: $${(scenarioTransactions.reduce((sum, t) => sum + t.TX_AMOUNT, 0) / scenarioTransactions.length).toFixed(2)}`
                    : 'No transactions'
                  }
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};