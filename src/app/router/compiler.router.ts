import api from "@/lib/axios";
import { handleApiError } from "@/utils/errors/handleApiError";
import { CompilerSchemaType } from "@/lib/schemas/Compliler.schema";

// Send code to the compiler API
export const compileCode = async (payload: CompilerSchemaType) => {
  try {
    const response = await api.post("/compiler/compile", payload);
    return response.data;
  } catch (error) {
    console.log(error,"error");
    return handleApiError(error);
  }
};