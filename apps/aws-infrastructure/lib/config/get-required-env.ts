/**
 * Returns the value of a required environment variable.
 *
 * @param name - The environment variable name (e.g. "BOOKINGS_SQS_FORWARDER_ENDPOINT").
 * @throws {Error} If the variable is not set or is an empty string.
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value && !process.env.CDK_BOOTSTRAP) {
    throw new Error(
      `Missing required environment variable "${name}". ` +
        `Set it before running cdk deploy.`,
    );
  }

  return value ?? "";
}
