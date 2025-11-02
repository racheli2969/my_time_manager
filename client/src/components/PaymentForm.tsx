import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { createPaymentIntent } from "../services/paymentService.ts"; // API call to backend
import { ENV_CONFIG } from "../config/env";

const stripePromise = loadStripe(ENV_CONFIG.STRIPE_PUBLIC_KEY || "");

const PaymentForm: React.FC<{ selectedPlan: any }> = ({ selectedPlan }) => {
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
            setError("Stripe has not loaded yet.");
            setLoading(false);
            return;
        }

        try {
            const { clientSecret } = await createPaymentIntent(); // Fetch client secret from backend

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setError("Card element not found.");
                setLoading(false);
                return;
            }

            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (stripeError) {
                setError(stripeError.message || "Payment failed.");
                setLoading(false);
                return;
            }

            if (paymentIntent?.status === "succeeded") {
                navigate("/dashboard"); // Redirect to dashboard on success
            } else {
                setError("Payment did not succeed.");
            }
        } catch (err) {
            setError("An error occurred during payment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-bold mb-4">Payment</h2>
            <p className="mb-4">You have selected the {selectedPlan} plan.</p>
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
                        loading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!stripe || loading}
                >
                    {loading ? "Processing..." : "Pay Now"}
                </button>
            </form>
        </div>
    );
};

const PaymentFormWrapper: React.FC<{ selectedPlan: any }> = ({ selectedPlan }) => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm selectedPlan={selectedPlan} />
        </Elements>
    );
};

export default PaymentFormWrapper;