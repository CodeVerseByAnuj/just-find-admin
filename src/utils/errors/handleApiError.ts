import { ZodError } from "zod";
import { toast } from "@/hooks/use-toast";

export const handleApiError = (
  error: any,
  fallbackMessage = "Something went wrong"
) => {
  let message = fallbackMessage;
  let title = "Error";

  // ✅ Handle Zod validation error (client-side schema)
  if (error instanceof ZodError) {
    title = "Validation Error";
    message = error.errors?.[0]?.message || "Invalid input data.";
  }

  // ✅ Handle no internet connection
  else if (!navigator.onLine) {
    title = "Network Error";
    message = "No internet connection. Please check your network.";
  }

  // ✅ Handle Axios/network/server error
  else if (!error.response) {
    title = "Network Error";
    message = "Unable to reach the server. Please try again.";
  } else {
    const status = error.response.status;
    switch (status) {
      case 400:
        title = "Bad Request";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Invalid request. Please check your input.";
        break;
      case 401:
        title = "";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Please log in again.";
        break;
      case 403:
        title = "Access Denied";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "You don’t have permission.";
        break;
      case 404:
        title = "Not Found";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Resource not found.";
        break;
      case 422:
        title = "Validation Error";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Please correct the errors.";
        break;
      case 500:
        title = "Server Error";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Something went wrong on our end.";
        break;
      case 503:
        title = "Service Unavailable";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Try again in a few minutes.";
        break;
      default:
        title = "Unexpected Error";
        message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          fallbackMessage;
        break;
    }
  }

  toast({
    title,
    description:
      typeof message === "object" && message !== null
        ? (message as any).message || (message as any).sqlMessage || JSON.stringify(message)
        : message,
    variant: "destructive",
  });

  return {
    status: error?.response?.status || 500,
    message,
    originalError: error,
  };
};
