import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { EnvironmentVariables } from './env.dto';

export function validateEnvironment(
  config: Record<string, unknown>
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true, // Automatically converts types (e.g., strings to numbers)
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed: ${errors
        .map((err) => Object.values(err.constraints).join(', '))
        .join('; ')}`
    );
  }

  return validatedConfig;
}
