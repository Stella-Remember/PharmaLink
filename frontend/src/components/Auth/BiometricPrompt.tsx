// src/components/Auth/BiometricPrompt.tsx
import React, { useState, useEffect } from 'react';
import { verifyBiometric, checkBiometricSupport } from '../../hooks/useBiometric';

interface BiometricPromptProps {
  isOpen: boolean;
  onVerified: () => void;
  onCancel: () => void;
  actionLabel?: string; // e.g. "complete this sale"
  isDark?: boolean;
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  isOpen, onVerified, onCancel, actionLabel = 'proceed', isDark = false
}) => {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'not-enrolled'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!isOpen) { setStatus('idle'); setErrorMsg(''); return; }

    checkBiometricSupport().then(({ supported, enrolled }) => {
      if (!supported) { setSupported(false); setStatus('not-enrolled'); return; }
      if (!enrolled) { setStatus('not-enrolled'); return; }
      // Auto-trigger on open
      handleVerify();
    });
  }, [isOpen]);

  const handleVerify = async () => {
    setStatus('scanning');
    setErrorMsg('');
    try {
      await verifyBiometric();
      setStatus('success');
      setTimeout(onVerified, 600);
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || 'Verification failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm">
      <div className={`rounded-3xl p-8 w-full max-w-sm mx-4 shadow-2xl text-center ${
        isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'
      }`}>

        {/* Fingerprint animation */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Pulse rings */}
          {status === 'scanning' && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
              <div className="absolute inset-2 rounded-full border-2 border-blue-400 animate-ping opacity-20 animation-delay-150" />
            </>
          )}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl transition-all duration-300 ${
            status === 'success'
              ? 'bg-green-100 scale-110'
              : status === 'error'
              ? 'bg-red-100'
              : status === 'scanning'
              ? 'bg-blue-100 scale-105'
              : isDark ? 'bg-gray-800' : 'bg-gray-100'
          }`}>
            {status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'not-enrolled' ? '⚙️' : '☝️'}
          </div>
        </div>

        {/* Title */}
        <h2 className={`text-xl font-black mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {status === 'success' ? 'Verified!' :
           status === 'scanning' ? 'Scanning...' :
           status === 'not-enrolled' ? 'Not Set Up' :
           status === 'error' ? 'Try Again' :
           'Identity Verification'}
        </h2>

        {/* Message */}
        <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {status === 'success'
            ? `Identity confirmed. Proceeding to ${actionLabel}...`
            : status === 'scanning'
            ? `Use your fingerprint or Face ID to ${actionLabel}`
            : status === 'not-enrolled'
            ? supported
              ? 'You need to enroll your biometric in Settings before using this feature.'
              : 'Your device does not support biometric authentication.'
            : status === 'error'
            ? errorMsg
            : `Biometric verification required to ${actionLabel}`}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onCancel}
            className={`flex-1 py-3 rounded-2xl font-bold text-sm border-2 transition ${
              isDark ? 'border-gray-700 text-gray-400 hover:bg-gray-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}>
            Cancel
          </button>

          {status !== 'success' && (
            <button
              onClick={handleVerify}
              disabled={status === 'scanning'}
              className={`flex-[2] py-3 rounded-2xl font-black text-sm text-white transition ${
                status === 'scanning'
                  ? 'bg-blue-400 cursor-wait'
                  : status === 'not-enrolled'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}>
              {status === 'scanning' ? '🔍 Scanning...' :
               status === 'error' ? '🔄 Retry' :
               status === 'not-enrolled' ? '⚙️ Go to Settings' :
               '☝️ Verify'}
            </button>
          )}
        </div>

        {/* Skip option for demo */}
        {(status === 'error' || status === 'not-enrolled') && (
          <button onClick={onVerified}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
            Skip verification (demo mode)
          </button>
        )}
      </div>
    </div>
  );
};

export default BiometricPrompt;