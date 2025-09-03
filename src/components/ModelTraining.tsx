import React, { useState } from 'react';
import { Transaction, ModelMetrics } from '../types/Transaction';
import { Brain, Play, Download, RotateCcw } from 'lucide-react';

interface ModelTrainingProps {
  transactions: Transaction[];
  onModelTrain: () => Promise<ModelMetrics>;
  onRuleBasedDetection: () => Promise<Transaction[]>;
  modelMetrics?: ModelMetrics;
  isTraining: boolean;
  onExportResults: () => void;
}

export const ModelTraining: React.FC<ModelTrainingProps> = ({
  transactions,
  onModelTrain,
  onRuleBasedDetection,
  modelMetrics,
  isTraining,
  onExportResults,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'neural' | 'rules'>('neural');

  const handleTrain = () => {
    if (selectedMethod === 'neural') {
      onModelTrain();
    } else {
      onRuleBasedDetection();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-indigo-600" />
          Fraud Detection Model
        </h3>
        
        {modelMetrics && (
          <button
            onClick={onExportResults}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Results
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Selection & Training */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detection Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as 'neural' | 'rules')}
              disabled={isTraining}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="neural">Neural Network (TensorFlow.js)</option>
              <option value="rules">Rule-Based Detection</option>
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-800 mb-2">
              {selectedMethod === 'neural' ? 'Neural Network Features:' : 'Rule-Based Features:'}
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {selectedMethod === 'neural' ? (
                <>
                  <li>• Transaction amount and time patterns</li>
                  <li>• Customer spending behavior analysis</li>
                  <li>• Terminal fraud rate statistics</li>
                  <li>• Amount anomaly detection</li>
                  <li>• Temporal patterns (time of day, day of week)</li>
                </>
              ) : (
                <>
                  <li>• Amount threshold detection (&gt;$220)</li>
                  <li>• Terminal fraud rate analysis</li>
                  <li>• Customer spending pattern anomalies</li>
                  <li>• Amount spike detection</li>
                </>
              )}
            </ul>
          </div>

          <button
            onClick={handleTrain}
            disabled={isTraining || transactions.length === 0}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isTraining || transactions.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : selectedMethod === 'neural'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isTraining ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                Training Model...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                {selectedMethod === 'neural' ? 'Train Neural Network' : 'Run Rule-Based Detection'}
              </>
            )}
          </button>
        </div>

        {/* Model Performance */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-800">Performance Metrics</h4>
          
          {modelMetrics ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="text-2xl font-bold text-green-600">
                    {(modelMetrics.accuracy * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-green-700">Accuracy</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {(modelMetrics.precision * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-700">Precision</div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
                  <div className="text-2xl font-bold text-indigo-600">
                    {(modelMetrics.recall * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-indigo-700">Recall</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {(modelMetrics.f1Score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-purple-700">F1 Score</div>
                </div>
              </div>

              {/* Confusion Matrix */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">Confusion Matrix</h5>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-green-600">
                      {modelMetrics.confusion_matrix[0][0]}
                    </div>
                    <div className="text-xs text-gray-600">True Negative</div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-orange-600">
                      {modelMetrics.confusion_matrix[0][1]}
                    </div>
                    <div className="text-xs text-gray-600">False Positive</div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-red-600">
                      {modelMetrics.confusion_matrix[1][0]}
                    </div>
                    <div className="text-xs text-gray-600">False Negative</div>
                  </div>
                  <div className="bg-white rounded p-2 border">
                    <div className="text-lg font-bold text-blue-600">
                      {modelMetrics.confusion_matrix[1][1]}
                    </div>
                    <div className="text-xs text-gray-600">True Positive</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Train a model to see performance metrics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};