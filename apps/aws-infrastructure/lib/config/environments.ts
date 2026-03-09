import * as cdk from "aws-cdk-lib";
import { Environments } from "@repo/common";
import { getRequiredEnv } from "./get-required-env";

/** Canonical project identifier — used in resource names, tags, and secret paths. */
export const PROJECT_NAME = "skye-hosts";

/** Human-readable project name — used in user-facing copy (emails, UI text). */
export const PROJECT_DISPLAY_NAME = "Skye Hosts";

/** Default AWS region for all environments. */
export const DEFAULT_REGION = "eu-west-1";

/**
 * Configuration shape for a deployment environment.
 *
 * Each environment maps to a distinct AWS account + region pair, allowing the
 * same CDK stacks to be deployed to staging, production, etc. with different
 * settings (removal policies, alarm thresholds, resource sizing, …).
 */
export interface EnvironmentConfig {
  /** Environment identifier from the shared enum. */
  readonly envName: Environments;

  /**
   * Target AWS account ID.
   *
   * Resolved at deploy-time from the CDK_DEPLOY_ACCOUNT environment variable
   * (explicitly set in CI/CD) or CDK_DEFAULT_ACCOUNT (the account associated
   * with the active AWS CLI profile / assumed role).
   */
  readonly account: string;

  /** AWS region to deploy into (e.g. "eu-west-1" for Ireland). */
  readonly region: string;

  /**
   * Whether this environment is production.
   *
   * Used to tighten resource settings in prod (e.g. RETAIN removal policies,
   * stricter alarms) vs. allowing clean teardown in non-prod environments.
   */
  readonly isProduction: boolean;
}

/**
 * All known deployment environments.
 *
 * To add a new environment (e.g. "staging"), add an entry here and provide
 * a corresponding CDK_DEPLOY_ACCOUNT_STAGING variable in your CI/CD pipeline.
 */
const environments: Record<string, EnvironmentConfig> = {
  [Environments.QA]: {
    envName: Environments.QA,
    account: getRequiredEnv("CDK_DEFAULT_ACCOUNT"),
    region: DEFAULT_REGION,
    isProduction: false,
  },

  [Environments.PRODUCTION]: {
    envName: Environments.PRODUCTION,
    account:
      process.env["CDK_DEPLOY_ACCOUNT"] ??
      getRequiredEnv("CDK_DEFAULT_ACCOUNT"),
    region: DEFAULT_REGION,
    isProduction: true,
  },
};

/**
 * Returns the {@link EnvironmentConfig} for the given environment name.
 *
 * @param envName - One of the keys defined in {@link environments} (e.g. "production").
 * @throws {Error} If the name does not match any configured environment.
 *
 * @example
 * const config = getEnvironmentConfig(Environments.PRODUCTION);
 */
export function getEnvironmentConfig(envName: string): EnvironmentConfig {
  const config = environments[envName];

  if (!config) {
    throw new Error(
      `Unknown environment "${envName}". ` +
        `Valid options are: ${Object.keys(environments).join(", ")}. ` +
        `Pass the target environment via CDK context: cdk deploy --context env=<name>`,
    );
  }

  return config;
}

/**
 * Converts an {@link EnvironmentConfig} into the CDK {@link cdk.Environment}
 * object expected by stack props.
 */
export function toCdkEnv(config: EnvironmentConfig): cdk.Environment {
  return { account: config.account, region: config.region };
}

// Re-export for convenience so stacks don't need to import from @repo/common directly.
export { Environments };
