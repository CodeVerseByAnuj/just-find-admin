import { toast } from "@/hooks/use-toast";

export const handleSuccessMessage = (
  response: any,
  fallbackMessage = "Operation successful"
) => {
  const message =
    response?.message ||
    response?.msg ||
    response?.detail ||
    fallbackMessage;

  toast({
    title: "Success",
    description: message,
    variant: "success",
  });
};
