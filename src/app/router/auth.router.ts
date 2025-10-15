// utils/api/auth.ts
import api from "@/lib/axios";
import { LoginFormData, ForgotPasswordFormData } from "@/lib/schemas/auth.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export const loginUser = async (payload: LoginFormData) => {
  try {
    const response = await api.post("/auth/login", payload);
    // ✅ Show success toast
    handleSuccessMessage(response, "Logged in successfully");
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, "Login failed");
  }
};

export const forgotPassword = async (payload: ForgotPasswordFormData) => {
  try {
    const response = await api.post("/auth/forgot-password", payload);
    handleSuccessMessage(response, "Email Sent Successfully");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "Login failed");
  }
};
