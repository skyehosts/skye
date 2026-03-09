import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { EnvironmentConfig, PROJECT_NAME } from "./environments";

export { getRequiredEnv } from "./get-required-env";

/**
 * Shared props for all CDK stacks in this project.
 *
 * Extends the standard CDK StackProps so callers can still pass `description`,
 * `terminationProtection`, etc. alongside the environment config.
 */
export interface BaseStackProps extends cdk.StackProps {
  /** Resolved environment configuration (account, region, env name, …). */
  readonly config: EnvironmentConfig;
}

/**
 * Returns the appropriate removal policy for the given environment.
 *
 * Production resources are retained on stack deletion to prevent accidental
 * data loss; non-production resources are destroyed for clean teardown.
 */
export function removalPolicy(config: EnvironmentConfig): cdk.RemovalPolicy {
  return config.isProduction
    ? cdk.RemovalPolicy.RETAIN
    : cdk.RemovalPolicy.DESTROY;
}

/**
 * Applies the standard set of tags to every resource in the given scope.
 *
 * Tags are essential for cost allocation reports, AWS Cost Explorer filtering,
 * and operational runbooks. CDK propagates them automatically to all child
 * resources.
 *
 * @param scope  - The construct to tag (typically `this` inside a Stack).
 * @param config - Environment config (provides project name and env name).
 * @param domain - Logical domain name (e.g. "auth", "bookings").
 */
export function applyStandardTags(
  scope: Construct,
  config: EnvironmentConfig,
  domain: string,
): void {
  cdk.Tags.of(scope).add("Project", PROJECT_NAME);
  cdk.Tags.of(scope).add("Environment", config.envName);
  cdk.Tags.of(scope).add("ManagedBy", "cdk");
  cdk.Tags.of(scope).add("Domain", domain);
}
