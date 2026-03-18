#!/usr/bin/env node
/**
 * aws-infrastructure — CDK App Entry Point
 *
 * This file is the root of the CDK application. The CDK CLI executes it via
 * ts-node (see `app` in cdk.json) to discover all stacks that should be
 * synthesised or deployed.
 *
 * Usage
 * ─────
 * # Synthesise CloudFormation templates (dry run, no AWS calls):
 *   pnpm synth:production
 *
 * # Preview changes against the live stack:
 *   pnpm diff:production
 *
 * # Deploy to production:
 *   pnpm deploy:production
 *
 * # Tear down (non-prod only — prod resources have RETAIN removal policy):
 *   pnpm destroy:production
 *
 * Selecting an environment
 * ─────────────────────────
 * Pass `--context env=<name>` to target a specific environment.
 * Defaults to "production" when no context value is provided.
 *
 * Required environment variables
 * ───────────────────────────────
 * CDK_DEPLOY_ACCOUNT   — AWS account ID to deploy into (preferred)
 * CDK_DEFAULT_ACCOUNT  — Fallback: automatically set by the CDK CLI from the
 *                        active AWS profile / assumed role
 * CDK_DEFAULT_REGION   — Automatically set by the CDK CLI (unused here because
 *                        each EnvironmentConfig hard-codes its target region)
 */

import * as cdk from "aws-cdk-lib";
import {
  Environments,
  getEnvironmentConfig,
  toCdkEnv,
  PROJECT_NAME,
} from "../lib/config/environments";
import { BookingsStack } from "../lib/stacks/bookings-stack";
import { ListingImagePipelineStack } from "../lib/stacks/image-pipeline-stack";
import { ScheduledMessagesStack } from "../lib/stacks/scheduled-messages-stack";

const app = new cdk.App();

// ---------------------------------------------------------------------------
// Resolve target environment
//
// `node.tryGetContext` reads values passed via --context flags or defined in
// cdk.json under "context". Returns undefined when the key is absent, so we
// default to "production" to make single-environment pipelines convenient.
// ---------------------------------------------------------------------------
const envName: string =
  app.node.tryGetContext("env") ?? Environments.PRODUCTION;
const config = getEnvironmentConfig(envName);

// ---------------------------------------------------------------------------
// Stacks
//
// Each logical domain gets its own stack. This limits the blast radius of
// a failed deployment — a broken bookings change won't touch other resources.
//
// Stack ID format: <project>-<domain>-<env>
// ---------------------------------------------------------------------------

new BookingsStack(app, `${PROJECT_NAME}-queue-${config.envName}`, {
  env: toCdkEnv(config),
  description: `${PROJECT_NAME} domain messaging infrastructure — ${config.envName}`,
  terminationProtection: config.isProduction,
  config,
});

new ListingImagePipelineStack(
  app,
  `${PROJECT_NAME}-image-pipeline-${config.envName}`,
  {
    env: toCdkEnv(config),
    description: `${PROJECT_NAME} image processing pipeline — ${config.envName}`,
    terminationProtection: config.isProduction,
    config,
  },
);

new ScheduledMessagesStack(
  app,
  `${PROJECT_NAME}-scheduled-messages-${config.envName}`,
  {
    env: toCdkEnv(config),
    description: `${PROJECT_NAME} scheduled messages infrastructure — ${config.envName}`,
    terminationProtection: config.isProduction,
    config,
  },
);
