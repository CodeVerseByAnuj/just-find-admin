
// utils/api/auth.ts
import api from "@/lib/axios";
import { CategoryFormSchema, CategorySchema } from "@/lib/schemas/category.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";
import { z } from "zod";

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

export const createCategory = async (data: z.infer<typeof CategoryFormSchema>) => {
    try {
        const response = await api.post("/category", data);
        handleSuccessMessage(response, "Category created successfully");
        return response.data;
    } catch (error) {
        handleApiError(error, "Failed to create category");
        throw error;
    }
};

export const updateCategory = async (id: string, data: z.infer<typeof CategoryFormSchema>) => {
    try {
        const response = await api.patch(`/category/${id}`, data);
        handleSuccessMessage(response, "Category updated successfully");
        return response.data;
    } catch (error) {
        handleApiError(error, "Failed to update category");
        throw error;
    }
};