
import { z } from "zod";


// 🔹 Category item schema
export const CategoryItemSchema = z.object({
	id: z.number(),
	name: z.string(),
});

// 🔹 Category response schema (with pagination)
export const CategorySchema = z.object({
	data: z.array(CategoryItemSchema),
	total: z.number(),
	page: z.number(),
	limit: z.number(),
	totalPages: z.number(),
});

export type CategoryItem = z.infer<typeof CategoryItemSchema>;
export type CategoryResponse = z.infer<typeof CategorySchema>;

// 🔹 Category form schema
export const CategoryFormSchema = z.object({
	name: z.string().min(1, "Category name is required"),
});

export type CategoryForm = z.infer<typeof CategoryFormSchema>;