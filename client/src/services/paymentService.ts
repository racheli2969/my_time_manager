// /client/src/services/paymentService.ts
import axios from "axios";

//change loaded from centralized env config
import { ENV_CONFIG } from '../config/env';
const API_BASE_URL = ENV_CONFIG.API_BASE_URL;

export const createPaymentIntent = async (): Promise<{ clientSecret: string }> => {
    try {
        const response = await axios.post(`${API_BASE_URL}/payments/create-intent`);
        return response.data;
    } catch (error) {
        console.error("Error creating payment intent:", error);
        throw new Error("Failed to create payment intent.");
    }
};
