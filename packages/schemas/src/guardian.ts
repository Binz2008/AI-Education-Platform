import { z } from 'zod'

// Guardian schema for AI Education Platform
export const GuardianSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email('Invalid email format'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  preferredLanguage: z.enum(['ar', 'en']).default('ar'),
  timezone: z.string().default('Asia/Dubai'),
  isEmailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  lastLogin: z.string().datetime().optional(),
})

export const CreateGuardianSchema = GuardianSchema.omit({
  id: true,
  isEmailVerified: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
})

export const UpdateGuardianSchema = CreateGuardianSchema.partial()

export type Guardian = z.infer<typeof GuardianSchema>
export type CreateGuardian = z.infer<typeof CreateGuardianSchema>
export type UpdateGuardian = z.infer<typeof UpdateGuardianSchema>
