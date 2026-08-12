/**
 * Env validation for ConfigModule.forRoot({ validate }).
 * Fails fast at bootstrap (before app.listen()) if required env vars are missing.
 * Never log/echo actual env values here.
 */
export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const jwtSecret = config.JWT_SECRET;

  if (typeof jwtSecret !== 'string' || jwtSecret.trim() === '') {
    throw new Error(
      'JWT_SECRET is not set. Set it in .env before starting the app.',
    );
  }

  return config;
}
