import { z } from "zod";
import { TimestampSchema, LanguageEnum, AgeGroupEnum } from "./common";

// Guardian (Parent) schema
export const GuardianSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  preferredLanguage: LanguageEnum.default("ar"),
  timezone: z.string().default("Asia/Dubai"),
  isEmailVerified: z.boolean().default(false)
}).merge(TimestampSchema);

// Child schema
export const ChildSchema = z.object({
  id: z.string().uuid(),
  guardianId: z.string().uuid(),
  firstName: z.string().min(2),
  birthDate: z.string().date(),
  ageGroup: AgeGroupEnum,
  preferredLanguage: LanguageEnum.default("ar"),
  avatar: z.string().url().optional(),
  
  // Parental controls
  dailyTimeLimit: z.number().min(10).max(180).default(30), // minutes
  enabledSubjects: z.array(z.enum(["arabic", "english", "islamic"])).default(["arabic"]),
  voiceEnabled: z.boolean().default(true),
  chatEnabled: z.boolean().default(true),
  
  // Privacy settings
  voiceRecordingAllowed: z.boolean().default(false),
  dataRetentionDays: z.number().min(1).max(90).default(30)
}).merge(TimestampSchema);

// Create child request
export const CreateChildSchema = ChildSchema.omit({
  id: true,
  guardianId: true,
  createdAt: true,
  updatedAt: true
});

// Update child request
export const UpdateChildSchema = CreateChildSchema.partial();

export type Guardian = z.infer<typeof GuardianSchema>;
export type Child = z.infer<typeof ChildSchema>;
export type CreateChildRequest = z.infer<typeof CreateChildSchema>;
export type UpdateChildRequest = z.infer<typeof UpdateChildSchema>;
