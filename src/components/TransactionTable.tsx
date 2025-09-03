import React, { useState, useMemo } from 'react';
import { Transaction } from '../types/Transaction';
import { ChevronDown, AlertTriangle, Shield, Filter } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  showPredictions?: boolean;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  showPredictions = false 
}) => {
  const [sortField, setSortField] = useState<keyof Transaction>('TX_DATETIME');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterFraud, setFilterFraud] = useState<'all' | 'fraud' | 'legitimate'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply fraud filter
    if (filterFraud === 'fraud') {
      filtered = filtered.filter(t => t.TX_FRAUD === 1);
    } else if (filterFraud === 'legitimate') {
      filtered = filtered.filter(t => t.TX_FRAUD === 0);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [transactions, sortField, sortDirection, filterFraud]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getScenarioText = (scenario: number | undefined) => {
    switch (scenario) {
      case 1: return 'High Amount';
      case 2: return 'Terminal';
      case 3: return 'Customer';
      default: return '-';
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-600" />
            Transaction Analysis
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterFraud}
                onChange={(e) => {
                  setFilterFraud(e.target.value as 'all' | 'fraud' | 'legitimate');
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Transactions</option>
                <option value="fraud">Fraudulent Only</option>
                <option value="legitimate">Legitimate Only</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('TRANSACTION_ID')}
              >
                <div className="flex items-center">
                  Transaction ID
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${
                    sortField === 'TRANSACTION_ID' && sortDirection === 'asc' ? 'rotate-180' : ''
                  }`} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('TX_DATETIME')}
              >
                <div className="flex items-center">
                  Date & Time
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${
                    sortField === 'TX_DATETIME' && sortDirection === 'asc' ? 'rotate-180' : ''
                  }`} />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('CUSTOMER_ID')}
              >
                Customer
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('TERMINAL_ID')}
              >
                Terminal
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('TX_AMOUNT')}
              >
                <div className="flex items-center">
                  Amount
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${
                    sortField === 'TX_AMOUNT' && sortDirection === 'asc' ? 'rotate-180' : ''
                  }`} />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scenario
              </th>
              {showPredictions && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prediction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedTransactions.map((transaction, index) => (
              <tr key={transaction.TRANSACTION_ID} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {transaction.TRANSACTION_ID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDateTime(transaction.TX_DATETIME)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transaction.CUSTOMER_ID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {transaction.TERMINAL_ID}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${transaction.TX_AMOUNT.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {transaction.TX_FRAUD === 1 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Fraudulent
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Shield className="w-3 h-3 mr-1" />
                      Legitimate
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {getScenarioText(transaction.TX_FRAUD_SCENARIO)}
                </td>
                {showPredictions && (
                  <>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.predicted_fraud === 1 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Fraud
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Safe
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {transaction.predicted_probability 
                        ? (transaction.predicted_probability * 100).toFixed(1) + '%'
                        : '-'
                      }
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};