'use client';

import React, { JSX } from 'react';
import Button from './Button'; 

interface AlertDialogProps {
  show: boolean;
  type: 'success' | 'error' | 'info'; 
  title: string;
  message: string;
  buttonText: string;
  onButtonClick: () => void;
  
  amount?: number | null;
  showAmount?: boolean; 
}

export default function AlertDialog({
  show,
  type,
  title,
  message,
  buttonText,
  onButtonClick,
  amount,
  showAmount = false, 
}: AlertDialogProps) {
  if (!show) {
    return null;
  }

  
  let icon: JSX.Element;
  let iconBgColor: string;
  let iconColor: string;
  let titleColor: string;

  switch (type) {
    case 'success':
      icon = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      iconBgColor = 'bg-green-100';
      iconColor = 'text-green-500';
      titleColor = 'text-gray-900';
      break;
    case 'error':
      icon = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      iconBgColor = 'bg-red-100';
      iconColor = 'text-red-500';
      titleColor = 'text-gray-900';
      break;
    case 'info':
    default:
      icon = (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      iconBgColor = 'bg-blue-100';
      iconColor = 'text-blue-500';
      titleColor = 'text-gray-900';
      break;
  }

  const formattedAmount = amount !== null && amount !== undefined ? amount.toLocaleString('id-ID') : 'N/A';

  return (
    <div 
  className="fixed inset-0 flex items-center justify-center z-50 p-4"
  style={{ 
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
    
    
  }}
>
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full text-center">
        {/* Icon Section */}
        <div className="flex justify-center mb-4">
          <div className={`${iconBgColor} p-3 rounded-full`}>
            <span className={`${iconColor}`}>{icon}</span>
          </div>
        </div>

        {/* Amount (Conditional for Success Type) */}
        {type === 'success' && showAmount && amount !== null && (
          <>
            <p className="text-gray-600 text-lg mb-2">Topup sebesar</p>
            <h3 className="text-3xl font-extrabold text-gray-900 mb-4">
              Rp {formattedAmount}
            </h3>
          </>
        )}

        {/* Title */}
        <h3 className={`text-xl font-bold ${titleColor} mb-2`}>{title}</h3>

        {/* Message */}
        <p className="text-lg text-gray-700 mb-6">{message}</p>

        {/* Button */}
        <Button onClick={onButtonClick} className="w-full bg-red-500 text-white hover:bg-red-600 py-3">
          {buttonText}
        </Button>
      </div>
    </div>
  );
}