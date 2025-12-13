import api from "@/lib/axios";
import { BusinessResponseSchema, BusinessListSchema } from "@/lib/schemas/business.schema";
import { handleApiError } from "@/utils/errors/handleApiError";
import { handleSuccessMessage } from "@/utils/success/handleSuccessMessage";
import { z } from "zod";
import { CategoryQueryParams } from "./category.router";

export interface BusinessQueryParams extends CategoryQueryParams {
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
}

export const getBusiness = async (params?: BusinessQueryParams) => {
    try {
        const response = await api.get("/business", {
            params: {
                search: params?.search ?? "",
                page: params?.page ?? 1,
                limit: params?.limit ?? 10,
                sortBy: params?.sortBy ?? "name",
                sortOrder: params?.sortOrder ?? "DESC",
            },
        });

        // API returns a wrapper: { success, statusCode, message, data: { businesses, total, ... } }
        const parsed = BusinessResponseSchema.parse(response.data);

        // Return the inner data object which contains businesses, total, page, limit, totalPages
        return parsed.data;
    } catch (error) {
        handleApiError(error, "Failed to fetch businesses");
        throw error;
    }
};

export const createBusiness = async (data: any) => {
    try {
        const response = await api.post('/business', data);
        handleSuccessMessage(response, 'Business created successfully');
        return response.data;
    } catch (error) {
        handleApiError(error, 'Failed to create business');
        throw error;
    }
};
