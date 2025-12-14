import { z } from 'zod';

// Category schema for business
const CategorySchema = z.object({
    id: z.number(),
    name: z.string().nullable()
});

// Individual Business schema
const BusinessSchema = z.object({
    id: z.number(),
    name: z.string(),
    city: z.string(),
    state: z.string(),
    rating: z.string(),
    verified: z.boolean(),
    slug: z.string(),
    is_premium: z.boolean(),
    sponsored: z.boolean(),
    packagesCount: z.number(),
    category: CategorySchema,
    images: z.union([z.array(z.string()), z.string()]).optional(),
    tags: z.union([z.array(z.string()), z.string()]).optional(),
    description: z.string().optional(),
    category_id: z.number().optional(),
    address: z.string().optional(),
    pincode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    website: z.string().optional(),
    open_time: z.string().optional(),
    close_time: z.string().optional(),
    views_count: z.number().optional(),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    ogImage: z.string().optional(),
});

// Business list response schema
const BusinessListSchema = z.object({
    businesses: z.array(BusinessSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number()
});

// Main response wrapper schema
const BusinessResponseSchema = z.object({
    data: BusinessListSchema
});

const BusinessFormSchema = z.object({
    name: z.string().min(2, "Name is required"),
    description: z.string().optional(),
    category_id: z.preprocess((val) => Number(val), z.number().optional()),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    website: z.string().url().optional(),
    rating: z.preprocess((v) => (v === "" ? undefined : Number(v)), z.number().optional()),
    verified: z.boolean().optional().default(false),
    images: z.string().optional(), // we'll parse to array from newline/comma-separated
    open_time: z.string().optional(),
    close_time: z.string().optional(),
    tags: z.string().optional(), // comma separated
    views_count: z.preprocess((v) => Number(v), z.number().optional()),
    is_premium: z.boolean().optional().default(false),
    sponsored: z.boolean().optional().default(false),
    seo_title: z.string().optional(),
    seo_description: z.string().optional(),
    slug: z.string().optional(),
    ogImage: z.string().optional(),
})


export {
    CategorySchema,
    BusinessSchema,
    BusinessListSchema,
    BusinessResponseSchema,
    BusinessFormSchema
};