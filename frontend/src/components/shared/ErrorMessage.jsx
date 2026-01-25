import React from "react";
import { AlertCircle } from "lucide-react";

const ErrorMessage = ({ message, onRetry, retryText = "Try Again" }) => {
  return (
    <div className="text-center py-12">
      <div className="max-w-md mx-auto">
        <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-gray-600 mb-6">{message}</p>
        {onRetry && (
          <div className="space-x-4">
            <button onClick={onRetry} className="btn-primary">
              {retryText}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Reload Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
