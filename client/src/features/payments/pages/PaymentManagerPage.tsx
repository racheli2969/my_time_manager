/**
 * Payment Manager Page
 * Main page for subscription plan selection and payment
 */

import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { PlanSelector } from '../components/PlanSelector';
import { PaymentForm } from '../components/PaymentForm';
import { ENV_CONFIG } from '../../../config/env';

const stripePromise = loadStripe(ENV_CONFIG.STRIPE_PUBLIC_KEY);

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

const SUBSCRIPTION_PLANS: Plan[] = [
  { id: 'free', name: 'Free', price: '0', features: ['Basic features', 'Up to 10 tasks', 'Single user'] },
  { id: 'paid', name: 'Paid', price: '10', features: ['Advanced features', 'Unlimited tasks', 'Team collaboration', 'Priority support'] },
  { id: 'pro', name: 'Pro', price: '20', features: ['All features', 'Unlimited tasks', 'Unlimited teams', 'Advanced analytics', '24/7 support'] },
];

/**
 * Payment management page with plan selection and Stripe integration
 */
export const PaymentManagerPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  return (
    <div className="p-6">
      <PlanSelector
        plans={SUBSCRIPTION_PLANS}
        selectedPlan={selectedPlan}
        onSelectPlan={handlePlanSelect}
      />
      {selectedPlan && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-2">Payment Details</h2>
          <Elements stripe={stripePromise}>
            <PaymentForm selectedPlan={selectedPlan} />
          </Elements>
        </div>
      )}
    </div>
  );
};

export default PaymentManagerPage;
