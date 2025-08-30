import { z } from 'zod'

// Child schema for AI Education Platform
export const ChildSchema = z.object({
  id: z.string().uuid(),
  guardianId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().datetime(),
  birthDate: z.string().datetime(), // Alias for dateOfBirth
  gender: z.enum(['male', 'female']),
  preferredLanguage: z.enum(['ar', 'en']).default('ar'),
  learningLevel: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  ageGroup: z.string().default('child'), // Age group classification
  interests: z.array(z.string()).default([]),
  specialNeeds: z.string().optional(),
  isActive: z.boolean().default(true),
  voiceEnabled: z.boolean().default(true), // Voice interaction enabled
  chatEnabled: z.boolean().default(true), // Chat interaction enabled
  totalPoints: z.number().default(0), // Total points earned
  currentStreak: z.number().default(0), // Current learning streak
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
})

export const CreateChildSchema = ChildSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateChildSchema = CreateChildSchema.partial()

export type Child = z.infer<typeof ChildSchema>
export type CreateChild = z.infer<typeof CreateChildSchema>
export type UpdateChild = z.infer<typeof UpdateChildSchema>
