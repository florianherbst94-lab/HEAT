'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { toast } from 'sonner';

interface StripeCheckoutFormProps {
  totalAmount: number;
  onSuccess: (paymentIntentId: string) => void;
  onBack: () => void;
}

export default function StripeCheckoutForm({
  totalAmount,
  onSuccess,
  onBack,
}: StripeCheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Prevent automatic redirect so we can handle order creation locally first
    });

    if (error) {
      toast.error(error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess(paymentIntent.id);
    } else {
      toast.error('Payment not completed.');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="font-display text-3xl font-bold text-white mb-6 uppercase tracking-widest border-b border-heat-chrome-dark pb-4">
        Payment Details
      </h2>

      <div className="bg-heat-black p-4 rounded-sm border border-heat-chrome-dark mb-6">
        <PaymentElement />
      </div>

      <div className="bg-heat-anthracite/50 border border-heat-chrome-dark p-6 mt-8 rounded-sm">
        <p className="text-heat-chrome text-sm mb-4">Total Amount to pay:</p>
        <p className="text-4xl font-display text-white mb-2">€{totalAmount.toFixed(2)}</p>
      </div>

      <div className="flex gap-4">
        <button 
          type="button" 
          onClick={onBack} 
          disabled={isProcessing} 
          className="w-1/3 bg-heat-black border border-heat-chrome text-white font-bold uppercase tracking-widest py-4 mt-8 hover:bg-white hover:text-heat-black transition-colors duration-300 disabled:opacity-50 rounded-sm"
        >
          Back
        </button>
        <button 
          type="submit" 
          disabled={!stripe || isProcessing} 
          className="w-2/3 bg-heat-red text-white font-bold uppercase tracking-widest py-4 mt-8 hover:bg-heat-wine transition-colors duration-300 flex items-center justify-center disabled:opacity-50 rounded-sm"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
}
