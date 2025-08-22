// /client/src/services/paymentService.ts
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export const createPaymentIntent = async (): Promise<{ clientSecret: string }> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/payments/create-intent`);
        return response.data;
    } catch (error) {
        console.error("Error creating payment intent:", error);
        throw new Error("Failed to create payment intent.");
    }
};
