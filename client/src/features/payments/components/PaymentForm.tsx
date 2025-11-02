/**
 * Payment Form Component
 * Stripe payment form for processing subscriptions
 */

import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { createPaymentIntent } from '../../../services/paymentService';

interface PaymentFormProps {
  selectedPlan: string;
}

/**
 * Form for entering card details and processing payment
 */
export const PaymentForm: React.FC<PaymentFormProps> = ({ selectedPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not loaded yet.');
      setLoading(false);
      return;
    }

    try {
      const { clientSecret } = await createPaymentIntent();

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        setError('Card element not found.');
        setLoading(false);
        return;
      }

      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed.');
        setLoading(false);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        navigate('/dashboard');
      } else {
        setError('Payment did not succeed.');
      }
    } catch (err) {
      setError('An error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">Payment</h2>
      <p className="mb-4">You have selected the <span className="font-semibold">{selectedPlan}</span> plan.</p>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="card-element" className="block text-sm font-medium text-gray-700">
            Card Details
          </label>
          <div className="mt-1 border border-gray-300 rounded-md p-2">
            <CardElement id="card-element" />
          </div>
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 bg-blue-600 text-white rounded-md ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
          disabled={!stripe || loading}
        >
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};
