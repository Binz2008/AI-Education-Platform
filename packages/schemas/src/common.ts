import { z } from "zod";

// Common enums and base schemas
export const SubjectEnum = z.enum(["arabic", "english", "islamic"]);
export const AgeGroupEnum = z.enum(["4-6", "7-9", "10-12"]);
export const DifficultyEnum = z.enum(["beginner", "intermediate", "advanced"]);
export const LanguageEnum = z.enum(["ar", "en"]);

// Base timestamp schema
export const TimestampSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional()
});

// Common response wrapper
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    message: z.string().optional(),
    errors: z.array(z.string()).optional()
  });

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  total: z.number().optional(),
  totalPages: z.number().optional()
});

export type Subject = z.infer<typeof SubjectEnum>;
export type AgeGroup = z.infer<typeof AgeGroupEnum>;
export type Difficulty = z.infer<typeof DifficultyEnum>;
export type Language = z.infer<typeof LanguageEnum>;
export type Pagination = z.infer<typeof PaginationSchema>;
