import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Notification = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="toast-container">
      <div className={`toast ${isSuccess ? 'toast-success' : isError ? 'toast-error' : ''}`}>
        {isSuccess ? <CheckCircle2 size={18} /> : isError ? <AlertCircle size={18} /> : <Info size={18} />}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};

