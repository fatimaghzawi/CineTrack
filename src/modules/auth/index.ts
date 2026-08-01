/**
 * Auth module public barrel.
 */

export { default as authRoutes } from './auth.routes';
export { AuthService, createAuthService } from './auth.service';
export { AuthController, createAuthController } from './auth.controller';
export { registerSchema, loginSchema } from './auth.schema';
export type { RegisterInput, LoginInput } from './auth.schema';
export type { AuthTokens, AuthUserSummary, AuthResult } from './auth.types';
export { hashPassword, verifyPassword } from './auth.password';
