import { env } from "./env";

type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const ENVIRONMENT_DEFAULTS: Record<string, LogLevel> = {
  local: "debug",
  qa: "info",
  preview: "warn",
  production: "error",
};

function getMinLevel(): LogLevel {
  try {
    const override = env.logLevel;
    if (override && override in LOG_LEVEL_PRIORITY) {
      return override as LogLevel;
    }
  } catch {
    // LOG_LEVEL not set — fall through to environment default
  }

  try {
    const environment = env.skyeEnvironment;
    return ENVIRONMENT_DEFAULTS[environment] ?? "error";
  } catch {
    return "debug";
  }
}

const minLevel = getMinLevel();
const minPriority = LOG_LEVEL_PRIORITY[minLevel];

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= minPriority;
}

function createLogger(tag: string) {
  const prefix = `[${tag}]`;

  return {
    debug: (...args: unknown[]) => {
      if (shouldLog("debug")) console.debug(prefix, ...args);
    },
    info: (...args: unknown[]) => {
      if (shouldLog("info")) console.info(prefix, ...args);
    },
    warn: (...args: unknown[]) => {
      if (shouldLog("warn")) console.warn(prefix, ...args);
    },
    error: (...args: unknown[]) => {
      if (shouldLog("error")) console.error(prefix, ...args);
    },
  };
}

export { createLogger, type LogLevel };
