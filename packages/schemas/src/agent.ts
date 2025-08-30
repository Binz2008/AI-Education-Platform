import { z } from "zod";
import { SubjectEnum, LanguageEnum } from "./common";

// Agent persona configuration
export const AgentPersonaSchema = z.object({
  name: z.string(),
  subject: SubjectEnum,
  style: z.enum(["patient", "encouraging", "wise", "playful", "calm"]),
  voice: z.enum(["male_warm", "female_friendly", "male_calm", "female_energetic"]),
  avatar: z.string().url().optional(),
  
  // Behavior rules
  rules: z.array(z.string()).min(1),
  contentGuardrails: z.array(z.string()).min(1),
  
  // Voice and communication settings
  speechRate: z.number().min(0.5).max(2.0).default(1.0),
  speechPitch: z.number().min(0.5).max(2.0).default(1.0),
  language: LanguageEnum,
  
  // AI model configuration
  modelTier: z.enum(["premium", "standard", "basic"]).default("standard"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().min(50).max(2000).default(500),
  
  // Content filtering
  ageAppropriate: z.boolean().default(true),
  profanityFilter: z.boolean().default(true),
  educationalFocus: z.boolean().default(true)
});

// Agent response schema
export const AgentResponseSchema = z.object({
  content: z.string(),
  contentType: z.enum(["text", "audio"]),
  audioUrl: z.string().url().optional(),
  suggestions: z.array(z.string()).optional(),
  feedback: z.object({
    encouragement: z.string().optional(),
    correction: z.string().optional(),
    hint: z.string().optional()
  }).optional(),
  metadata: z.object({
    confidence: z.number().min(0).max(1).optional(),
    processingTime: z.number().optional(),
    modelUsed: z.string().optional()
  }).optional()
});

// Agent prompt template
export const PromptTemplateSchema = z.object({
  system: z.string(),
  userPrefix: z.string().optional(),
  contextTemplate: z.string().optional(),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string()
  })).optional()
});

export type AgentPersona = z.infer<typeof AgentPersonaSchema>;
export type AgentResponse = z.infer<typeof AgentResponseSchema>;
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;
