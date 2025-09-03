import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileLoad: (data: string) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoad, isLoading }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content);
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Upload Transaction Data</h3>
        <p className="text-gray-600 mb-6">
          Upload your CSV file containing transaction data for fraud detection analysis
        </p>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isLoading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer flex flex-col items-center ${
              isLoading ? 'opacity-50' : 'hover:text-blue-600'
            } transition-colors`}
          >
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
            <span className="text-lg font-medium text-gray-700">
              {isLoading ? 'Processing...' : 'Click to upload CSV file'}
            </span>
            <span className="text-sm text-gray-500 mt-2">
              Supports CSV files with transaction data
            </span>
          </label>
        </div>

        <div className="mt-6 text-left">
          <h4 className="font-medium text-gray-800 mb-2">Expected CSV Columns:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• TRANSACTION_ID</li>
            <li>• TX_DATETIME</li>
            <li>• CUSTOMER_ID</li>
            <li>• TERMINAL_ID</li>
            <li>• TX_AMOUNT</li>
            <li>• TX_TIME_SECONDS</li>
            <li>• TX_TIME_DAYS</li>
            <li>• TX_FRAUD</li>
            <li>• TX_FRAUD_SCENARIO</li>
          </ul>
        </div>
      </div>
    </div>
  );
};