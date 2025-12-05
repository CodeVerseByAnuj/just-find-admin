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
    category: CategorySchema
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


export {
    CategorySchema,
    BusinessSchema,
    BusinessListSchema,
    BusinessResponseSchema,
};