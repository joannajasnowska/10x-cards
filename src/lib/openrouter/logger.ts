import { type ApiError } from "./types";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export class OpenRouterLogger {
  private readonly service = "OpenRouterService";
  private readonly isDev = import.meta.env.DEV;

  public debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDev) {
      this.log("debug", message, context);
    }
  }

  public info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log("warn", message, context);
  }

  public error(message: string, error: ApiError): void {
    this.log("error", message, {
      code: error.code,
      message: error.message,
      details: error.details,
    });
  }

  private log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const logMessage: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
    };

    // In development, log to console with colors
    if (this.isDev) {
      const color = this.getLogColor(level);
      console.log(
        `%c${logMessage.timestamp} [${this.service}] ${level.toUpperCase()}: ${message}`,
        `color: ${color}; font-weight: bold;`
      );
      if (context) {
        console.log(context);
      }
      return;
    }

    // In production, use structured logging
    console.log(JSON.stringify(logMessage));
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return undefined;

    // Remove sensitive data
    const sanitized = { ...context };
    const sensitiveKeys = [
      "apiKey",
      "authorization",
      "password",
      "token",
      "email",
      "user",
      "userData",
      "auth",
      "credentials",
      "userId",
      "refreshToken",
      "accessToken",
    ];

    Object.keys(sanitized).forEach((key) => {
      if (
        sensitiveKeys.includes(key.toLowerCase()) ||
        key.toLowerCase().includes("password") ||
        key.toLowerCase().includes("token")
      ) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }

  private getLogColor(level: LogLevel): string {
    switch (level) {
      case "debug":
        return "#6c757d"; // gray
      case "info":
        return "#0d6efd"; // blue
      case "warn":
        return "#ffc107"; // yellow
      case "error":
        return "#dc3545"; // red
      default:
        return "#000000"; // black
    }
  }
}
