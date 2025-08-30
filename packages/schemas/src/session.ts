import { z } from "zod";
import { SubjectEnum, TimestampSchema } from "./common";

// Chat message schema
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["child", "agent"]),
  content: z.string(),
  contentType: z.enum(["text", "audio"]).default("text"),
  audioUrl: z.string().url().optional(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional()
});

// Session progress schema
export const SessionProgressSchema = z.object({
  activitiesCompleted: z.array(z.string()).default([]),
  currentActivity: z.string().optional(),
  score: z.number().min(0).max(100).default(0),
  timeSpent: z.number().default(0), // in minutes
  engagementLevel: z.enum(["low", "medium", "high"]).optional(),
  hintsUsed: z.number().default(0)
});

// Learning session schema
export const SessionSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  lessonId: z.string().uuid(),
  subject: SubjectEnum,
  agentId: z.string(),
  
  // Session state
  status: z.enum(["active", "paused", "completed", "abandoned"]),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  
  // Progress and content
  progress: SessionProgressSchema,
  messages: z.array(ChatMessageSchema).default([]),
  
  // Assessment
  finalScore: z.number().min(0).max(100).optional(),
  pointsEarned: z.number().min(0).default(0),
  badgesEarned: z.array(z.string()).default([]),
  
  // Metadata
  deviceInfo: z.object({
    userAgent: z.string().optional(),
    platform: z.string().optional(),
    screenSize: z.string().optional()
  }).optional()
}).merge(TimestampSchema);

// Start session request
export const StartSessionSchema = z.object({
  childId: z.string().uuid(),
  lessonId: z.string().uuid(),
  agentId: z.string()
});

// Send message request
export const SendMessageSchema = z.object({
  sessionId: z.string().uuid(),
  content: z.string().min(1),
  contentType: z.enum(["text", "audio"]).default("text"),
  audioData: z.string().optional() // base64 encoded
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type SessionProgress = z.infer<typeof SessionProgressSchema>;
export type Session = z.infer<typeof SessionSchema>;
export type StartSessionRequest = z.infer<typeof StartSessionSchema>;
export type SendMessageRequest = z.infer<typeof SendMessageSchema>;
