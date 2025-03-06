import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorDisplayProps {
  message: string;
  fullScreen?: boolean;
}

export const ErrorDisplay = ({ message, fullScreen = false }: ErrorDisplayProps) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="mr-2 h-4 w-4" />
          <span>{message}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 m-6 flex justify-center items-center rounded-md border border-red-200 bg-red-50 text-red-700">
      <AlertCircle className="mr-2 h-4 w-4" />
      <span>{message}</span>
    </div>
  );
};
