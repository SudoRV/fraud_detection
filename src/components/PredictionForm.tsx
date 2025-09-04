import React, { useState } from 'react';
import { Calculator, AlertTriangle, Shield, Calendar, DollarSign, User, Monitor } from 'lucide-react';

interface PredictionFormProps {
  onPredict: (transaction: any) => Promise<{ isFraud: boolean; probability: number; scenario?: string }>;
  isModelTrained: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ onPredict, isModelTrained }) => {
  const [formData, setFormData] = useState({
    transactionId: '',
    datetime: '',
    customerId: '',
    terminalId: '',
    amount: '',
    timeSeconds: '',
    timeDays: ''
  });
  
  const [prediction, setPrediction] = useState<{
    isFraud: boolean;
    probability: number;
    scenario?: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setPrediction(null); // Clear previous prediction
  };

  const handlePredict = async () => {
    if (!isModelTrained) {
      alert('Please train a model first in the Model Training tab');
      return;
    }

    // Validate required fields
    if (!formData.amount || !formData.customerId || !formData.terminalId) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const transaction = {
        TRANSACTION_ID: formData.transactionId || `pred_${Date.now()}`,
        TX_DATETIME: formData.datetime || new Date().toISOString(),
        CUSTOMER_ID: formData.customerId,
        TERMINAL_ID: formData.terminalId,
        TX_AMOUNT: parseFloat(formData.amount),
        TX_TIME_SECONDS: parseInt(formData.timeSeconds) || Math.floor(Date.now() / 1000),
        TX_TIME_DAYS: parseInt(formData.timeDays) || Math.floor(Date.now() / (1000 * 60 * 60 * 24)),
        TX_FRAUD: 0 // Unknown, we're predicting this
      };

      const result = await onPredict(transaction);
      setPrediction(result);
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Error making prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = () => {
    const now = new Date();
    const customerId = `CUST_${Math.floor(Math.random() * 10000)}`;
    const terminalId = `TERM_${Math.floor(Math.random() * 1000)}`;
    const amount = (Math.random() * 300 + 10).toFixed(2);
    
    setFormData({
      transactionId: `TXN_${Date.now()}`,
      datetime: now.toISOString().slice(0, 16),
      customerId,
      terminalId,
      amount,
      timeSeconds: Math.floor(now.getTime() / 1000).toString(),
      timeDays: Math.floor(now.getTime() / (1000 * 60 * 60 * 24)).toString()
    });
    setPrediction(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Calculator className="w-6 h-6 mr-3 text-blue-600" />
            Transaction Fraud Prediction
          </h2>
          <button
            onClick={generateSampleData}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
          >
            Generate Sample Data
          </button>
        </div>
        <p className="text-gray-600">
          Enter transaction details to predict if it's fraudulent using the trained model
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Transaction Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Transaction ID
            </label>
            <input
              type="text"
              value={formData.transactionId}
              onChange={(e) => handleInputChange('transactionId', e.target.value)}
              placeholder="TXN_123456"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* DateTime */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={formData.datetime}
              onChange={(e) => handleInputChange('datetime', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Customer ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Customer ID *
            </label>
            <input
              type="text"
              value={formData.customerId}
              onChange={(e) => handleInputChange('customerId', e.target.value)}
              placeholder="CUSTOMER_123"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Terminal ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Monitor className="w-4 h-4 inline mr-1" />
              Terminal ID *
            </label>
            <input
              type="text"
              value={formData.terminalId}
              onChange={(e) => handleInputChange('terminalId', e.target.value)}
              placeholder="TERMINAL_456"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Transaction Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="150.00"
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Seconds */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time (Seconds)
            </label>
            <input
              type="number"
              value={formData.timeSeconds}
              onChange={(e) => handleInputChange('timeSeconds', e.target.value)}
              placeholder="1640995200"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Time Days */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time (Days)
            </label>
            <input
              type="number"
              value={formData.timeDays}
              onChange={(e) => handleInputChange('timeDays', e.target.value)}
              placeholder="18993"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handlePredict}
            disabled={isLoading || !isModelTrained || !formData.amount || !formData.customerId || !formData.terminalId}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLoading || !isModelTrained || !formData.amount || !formData.customerId || !formData.terminalId
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Transaction...
              </>
            ) : (
              <>
                <Calculator className="w-4 h-4" />
                Predict Fraud Risk
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prediction Result */}
      {prediction && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Prediction Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fraud Status */}
            <div className={`rounded-lg p-4 border-2 ${
              prediction.isFraud 
                ? 'bg-red-50 border-red-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-center mb-2">
                {prediction.isFraud ? (
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                ) : (
                  <Shield className="w-8 h-8 text-green-600" />
                )}
              </div>
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  prediction.isFraud ? 'text-red-600' : 'text-green-600'
                }`}>
                  {prediction.isFraud ? 'FRAUDULENT' : 'LEGITIMATE'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Classification Result
                </div>
              </div>
            </div>

            {/* Confidence Score */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {(prediction.probability * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-blue-700 mt-1">
                  Fraud Probability
                </div>
                <div className="mt-2">
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${prediction.probability * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div className={`rounded-lg p-4 border-2 ${
              prediction.probability > 0.8 ? 'bg-red-50 border-red-200' :
              prediction.probability > 0.5 ? 'bg-orange-50 border-orange-200' :
              prediction.probability > 0.2 ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className="text-center">
                <div className={`text-xl font-bold ${
                  prediction.probability > 0.8 ? 'text-red-600' :
                  prediction.probability > 0.5 ? 'text-orange-600' :
                  prediction.probability > 0.2 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {prediction.probability > 0.8 ? 'HIGH' :
                   prediction.probability > 0.5 ? 'MEDIUM' :
                   prediction.probability > 0.2 ? 'LOW' : 'MINIMAL'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Risk Level
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          {prediction.scenario && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Detection Details</h4>
              <p className="text-sm text-gray-600">
                Fraud scenario detected: {prediction.scenario}
              </p>
            </div>
          )}

          {/* Risk Factors */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Risk Factors Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Amount Analysis:</span>
                <span className={`ml-2 ${
                  parseFloat(formData.amount) > 220 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {parseFloat(formData.amount) > 220 ? 'High amount (>$220)' : 'Normal amount'}
                </span>
              </div>
              <div>
                <span className="font-medium">Transaction Time:</span>
                <span className="ml-2 text-gray-600">
                  {formData.datetime ? new Date(formData.datetime).toLocaleString() : 'Current time'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Model Status */}
      {!isModelTrained && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-yellow-800">
              No model trained yet. Please go to the Model Training tab to train a fraud detection model first.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};