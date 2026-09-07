import React, { useState, useEffect } from 'react';
import { CreditCard, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useToastStore } from '../hooks/useToast';

interface Props {
  feeId: string;
  feeType: string;
  amount: number;
  totalPaid: number;
  studentId: string;
  onSuccess: () => void;
}

export function PaymentModal({ feeId, feeType, amount, totalPaid, studentId, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [paying, setPaying] = useState(false);
  const [payAmount, setPayAmount] = useState(0);
  const addToast = useToastStore((s) => s.addToast);

  const remaining = amount - totalPaid;

  useEffect(() => {
    setPayAmount(remaining);
  }, [amount, totalPaid]);

  const handlePay = async () => {
    if (payAmount <= 0) {
      addToast({ type: 'error', title: 'Enter a valid payment amount' });
      return;
    }
    if (payAmount > remaining) {
      addToast({ type: 'error', title: `Amount cannot exceed ₹${remaining.toLocaleString()}` });
      return;
    }
    setPaying(true);
    try {
      const receipt = `RCP-${Date.now().toString(36).toUpperCase()}`;
      const newStatus = totalPaid + payAmount >= amount ? 'paid' : 'partial';

      const { error } = await supabase.from('fee_payments').insert({
        student_id: studentId,
        fee_structure_id: feeId,
        amount_paid: payAmount,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        receipt_number: receipt,
        status: newStatus,
      });

      if (error) throw error;

      addToast({ type: 'success', title: `Payment recorded! Receipt: ${receipt}` });
      setOpen(false);
      onSuccess();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Payment failed' });
    } finally {
      setPaying(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-1.5"
      >
        <CreditCard className="w-3.5 h-3.5" />
        Record Payment
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !paying && setOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <h3 className="text-lg font-bold text-neutral-900 mb-4">Record Fee Payment</h3>

              <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-neutral-500">{feeType}</p>
                <p className="text-2xl font-bold text-neutral-900">₹{amount.toLocaleString()}</p>
                {totalPaid > 0 && (
                  <div className="flex items-center gap-2 text-sm text-neutral-500 mt-1">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    <span>₹{totalPaid.toLocaleString()} already paid</span>
                  </div>
                )}
                <div className="mt-3 p-3 bg-primary-50 rounded-lg flex items-center justify-between">
                  <span className="text-sm font-medium text-primary-700">Amount Due</span>
                  <span className="text-lg font-bold text-primary-700">₹{remaining.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">₹</span>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Math.min(Number(e.target.value), remaining))}
                      max={remaining}
                      min={0}
                      className="w-full pl-7 pr-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setOpen(false)}
                  disabled={paying}
                  className="flex-1 px-4 py-2.5 border border-neutral-200 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePay}
                  disabled={paying || payAmount <= 0}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {paying ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Record ₹{payAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
