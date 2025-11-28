// utils/api/auth.ts
import api from "@/lib/axios";
import { CategoryFormSchema, CategorySchema } from "@/lib/schemas/category.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";

export interface CategoryQueryParams {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}

export const getCategory = async (params?: CategoryQueryParams) => {
    try {
        const response = await api.get("/category", {
            params: {
                search: params?.search ?? "",
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                sortBy: params?.sortBy ?? "name",
                sortOrder: params?.sortOrder ?? "DESC",
            },
        });
        handleSuccessMessage(response, "Categories fetched successfully");
        const categories = CategorySchema.parse(response.data.data);
        return {
            categories,
            total: response.data.total 
        };
    } catch (error) {
        handleApiError(error, "Failed to fetch categories");
        throw error;
    }
};
