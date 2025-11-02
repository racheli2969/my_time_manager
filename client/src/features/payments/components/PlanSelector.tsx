/**
 * Plan Selector Component
 * Displays subscription plan options
 */

import React from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
}

interface PlanSelectorProps {
  plans: Plan[];
  selectedPlan: string;
  onSelectPlan: (planId: string) => void;
}

/**
 * Grid of subscription plan cards
 */
export const PlanSelector: React.FC<PlanSelectorProps> = ({
  plans,
  selectedPlan,
  onSelectPlan
}) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Choose Your Subscription Plan</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === plan.id ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onClick={() => onSelectPlan(plan.id)}
          >
            <h2 className="text-xl font-semibold">{plan.name}</h2>
            <p className="text-lg font-bold">${plan.price}/month</p>
            <ul className="mt-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="text-sm text-gray-600">
                  - {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};
