import React from "react";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "./PaymentForm.tsx";
import { ENV_CONFIG } from "../config/env";

const stripePromise = loadStripe(ENV_CONFIG.STRIPE_PUBLIC_KEY);

const PaymentManager: React.FC = () => {
    const [selectedPlan, setSelectedPlan] = useState<string>("");

    const subscriptionPlans = [
        { id: "free", name: "Free", price: "0", features: ["Basic features"] },
        { id: "paid", name: "Paid", price: "10", features: ["Advanced features"] },
        { id: "pro", name: "Pro", price: "20", features: ["All features"] },
    ];

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Choose Your Subscription Plan</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subscriptionPlans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`border rounded-lg p-4 ${
                            selectedPlan === plan.id ? "border-blue-500" : "border-gray-300"
                        }`}
                        onClick={() => handlePlanSelect(plan.id)}
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

export default PaymentManager;