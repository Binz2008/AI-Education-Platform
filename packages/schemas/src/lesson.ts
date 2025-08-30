import { z } from "zod";
import { SubjectEnum, DifficultyEnum, AgeGroupEnum, TimestampSchema } from "./common";

// Lesson content type
export const LessonContentSchema = z.object({
  type: z.enum(["text", "audio", "video", "interactive"]),
  content: z.string(),
  duration: z.number().optional(), // in minutes
  metadata: z.record(z.any()).optional()
});

// Activity within a lesson
export const ActivitySchema = z.object({
  id: z.string(),
  type: z.enum(["reading", "listening", "speaking", "writing", "quiz", "game"]),
  title: z.string(),
  description: z.string(),
  content: LessonContentSchema,
  expectedDuration: z.number(), // in minutes
  points: z.number().min(0).default(10),
  requiredForCompletion: z.boolean().default(true)
});

// Main lesson schema
export const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(3),
  description: z.string(),
  subject: SubjectEnum,
  ageGroup: AgeGroupEnum,
  difficulty: DifficultyEnum,
  
  // Content
  activities: z.array(ActivitySchema).min(1),
  estimatedDuration: z.number(), // total minutes
  
  // Learning objectives
  objectives: z.array(z.string()).min(1),
  keywords: z.array(z.string()).default([]),
  
  // Prerequisites and progression
  prerequisites: z.array(z.string()).default([]), // lesson IDs
  unlocks: z.array(z.string()).default([]), // lesson IDs
  
  // Metadata
  isPublished: z.boolean().default(false),
  tags: z.array(z.string()).default([])
}).merge(TimestampSchema);

// Create lesson request
export const CreateLessonSchema = LessonSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LessonContent = z.infer<typeof LessonContentSchema>;
export type Activity = z.infer<typeof ActivitySchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type CreateLessonRequest = z.infer<typeof CreateLessonSchema>;
