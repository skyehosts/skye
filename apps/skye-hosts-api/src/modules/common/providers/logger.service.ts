import { ConsoleLogger } from '@nestjs/common';
import { RequestContext, requestContext } from '../../../main.config';

export class LoggerService extends ConsoleLogger {
  private getRequestContext(): RequestContext {
    const context = requestContext.getStore();
    return context && context.userId ? context : null;
  }

  debug(method: string, subject?: string, ...rest: any): void {
    const { classname, combined } = this.parse(method, subject, ...rest);
    super.debug(combined, classname ?? '');
    const userContext = this.getRequestContext();
    // Send to something like Azure application insights?
  }

  warn(method: string, subject?: string, ...rest: any): void {
    const { classname, combined } = this.parse(method, subject, ...rest);
    super.warn(combined, classname ?? '');
    const userContext = this.getRequestContext();
    // Send to something like Azure application insights?
  }

  error(method: string, subject?: string, ...rest: any): void {
    const { classname, combined, stack } = this.parse(method, subject, ...rest);
    super.error(combined, stack, classname ?? '');
    const userContext = this.getRequestContext();
    // Send to something like Azure application insights?
  }

  private parse(
    method: unknown,
    subject?: unknown,
    ...rest: unknown[]
  ): { combined: string; classname: string; stack: string | undefined } {
    const data = rest?.length ? rest[0] : undefined;
    const classname = rest[rest.length - 1] as string;

    let stack: string | undefined;
    let loggableData: unknown = data;
    if (data && typeof data === 'object' && 'stack' in data) {
      const { stack: extractedStack, ...rest } = data as Record<
        string,
        unknown
      >;
      stack = extractedStack as string;
      loggableData = rest;
    }

    let formattedObject: any;
    try {
      formattedObject = loggableData ? JSON.stringify(loggableData) : undefined;
    } catch (error) {
      // stringify failed
    }
    const combined = `${method} | ${subject}${
      formattedObject ? ` | ${formattedObject}` : ''
    }`;
    return { classname, combined, stack };
  }
}
