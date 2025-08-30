import { z } from "zod";

// Authentication schemas
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Terms must be accepted"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

export const TokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number()
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string()
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;
export type TokenResponse = z.infer<typeof TokenSchema>;
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>;
