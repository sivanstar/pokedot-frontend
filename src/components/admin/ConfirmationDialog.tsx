import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info, AlertCircle } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  data?: any;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
  data
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: <XCircle className="w-12 h-12 text-red-500" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
      cancelButton: 'text-red-700 hover:bg-red-100'
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
      cancelButton: 'text-yellow-700 hover:bg-yellow-100'
    },
    info: {
      icon: <Info className="w-12 h-12 text-blue-500" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      cancelButton: 'text-blue-700 hover:bg-blue-100'
    },
    success: {
      icon: <CheckCircle className="w-12 h-12 text-green-500" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      confirmButton: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
      cancelButton: 'text-green-700 hover:bg-green-100'
    }
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`${config.bgColor} border ${config.borderColor} rounded-2xl max-w-md w-full shadow-xl`}>
        <div className="p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              {config.icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-700 mb-6">{message}</p>
            
            {/* Display additional data if provided */}
            {data && (
              <div className="w-full mb-6 bg-white/50 rounded-lg p-4 text-left">
                <div className="text-sm font-medium text-gray-700 mb-2">Details:</div>
                {Object.entries(data).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex w-full space-x-3">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 border border-transparent rounded-lg font-medium ${
                  config.cancelButton
                } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50`}
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 border border-transparent rounded-lg font-medium text-white ${
                  config.confirmButton
                } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  confirmText
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
