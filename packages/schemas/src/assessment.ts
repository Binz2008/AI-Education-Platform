import { z } from "zod";
import { SubjectEnum, TimestampSchema } from "./common";

// Assessment criteria schema
export const AssessmentCriteriaSchema = z.object({
  skill: z.string(), // e.g., "pronunciation", "comprehension", "grammar"
  weight: z.number().min(0).max(1), // relative importance
  description: z.string(),
  rubric: z.array(z.object({
    level: z.enum(["novice", "developing", "proficient", "advanced"]),
    description: z.string(),
    points: z.number().min(0).max(10)
  }))
});

// Individual assessment result
export const AssessmentResultSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  childId: z.string().uuid(),
  subject: SubjectEnum,
  
  // Scores by skill
  skillScores: z.record(z.string(), z.number().min(0).max(100)),
  overallScore: z.number().min(0).max(100),
  
  // Detailed feedback
  strengths: z.array(z.string()).default([]),
  areasForImprovement: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  
  // Progress tracking
  masteredSkills: z.array(z.string()).default([]),
  strugglingSkills: z.array(z.string()).default([]),
  
  // AI confidence and metadata
  assessmentConfidence: z.number().min(0).max(1).optional(),
  assessmentMethod: z.enum(["rule_based", "ai_evaluated", "hybrid"]),
  
  // Time-based metrics
  responseTime: z.number().optional(), // milliseconds
  timeToComplete: z.number().optional() // minutes
}).merge(TimestampSchema);

// Progress report schema
export const ProgressReportSchema = z.object({
  id: z.string().uuid(),
  childId: z.string().uuid(),
  guardianId: z.string().uuid(),
  period: z.object({
    startDate: z.string().date(),
    endDate: z.string().date()
  }),
  
  // Overall statistics
  totalSessions: z.number().min(0),
  totalTimeSpent: z.number().min(0), // minutes
  averageScore: z.number().min(0).max(100),
  
  // Subject-wise breakdown
  subjectProgress: z.record(SubjectEnum, z.object({
    sessionsCompleted: z.number().min(0),
    averageScore: z.number().min(0).max(100),
    timeSpent: z.number().min(0),
    lessonsCompleted: z.array(z.string()),
    skillsImproved: z.array(z.string()),
    nextRecommendations: z.array(z.string())
  })),
  
  // Achievements and rewards
  badgesEarned: z.array(z.object({
    badgeId: z.string(),
    earnedAt: z.string().datetime(),
    subject: SubjectEnum.optional()
  })),
  pointsEarned: z.number().min(0),
  
  // Parent insights
  parentRecommendations: z.array(z.string()).default([]),
  celebrateAchievements: z.array(z.string()).default([]),
  concernAreas: z.array(z.string()).default([])
}).merge(TimestampSchema);

// Badge/achievement schema
export const BadgeSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  iconUrl: z.string().url(),
  subject: SubjectEnum.optional(),
  criteria: z.object({
    type: z.enum(["sessions_completed", "score_threshold", "streak", "skill_mastery"]),
    value: z.number(),
    timeframe: z.enum(["day", "week", "month", "all_time"]).optional()
  }),
  rarity: z.enum(["common", "rare", "epic", "legendary"]).default("common"),
  points: z.number().min(0).default(10)
});

export type AssessmentCriteria = z.infer<typeof AssessmentCriteriaSchema>;
export type AssessmentResult = z.infer<typeof AssessmentResultSchema>;
export type ProgressReport = z.infer<typeof ProgressReportSchema>;
export type Badge = z.infer<typeof BadgeSchema>;
