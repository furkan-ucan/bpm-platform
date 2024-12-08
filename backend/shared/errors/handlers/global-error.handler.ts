import { type Request, type Response, type NextFunction } from "express";
import logger from "@/monitoring/logging/providers/winston.logger";

import {
  ValidationError,
  NotFoundError,
  AuthError,
  BusinessError,
  TechnicalError,
} from "../types";

export const globalErrorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Hata detaylarını logla
  logger.error("Error occurred:", {
    error: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    path: req.path,
    method: req.method,
    userId: (req as any).user?._id,
    timestamp: new Date().toISOString(),
  });

  // Hata tipine göre yanıt döndür
  if (error instanceof ValidationError) {
    return res.status(400).json({
      status: "error",
      code: "VALIDATION_ERROR",
      message: error.message,
      errors: error.errors,
    });
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({
      status: "error",
      code: "NOT_FOUND",
      message: error.message,
    });
  }

  if (error instanceof AuthError) {
    return res.status(401).json({
      status: "error",
      code: "AUTH_ERROR",
      message: error.message,
    });
  }

  if (error instanceof BusinessError) {
    return res.status(400).json({
      status: "error",
      code: "BUSINESS_ERROR",
      message: error.message,
    });
  }

  if (error instanceof TechnicalError) {
    return res.status(500).json({
      status: "error",
      code: "TECHNICAL_ERROR",
      message:
        process.env.NODE_ENV === "production"
          ? "An internal server error occurred"
          : error.message,
    });
  }

  // Default error
  return res.status(500).json({
    status: "error",
    code: "INTERNAL_ERROR",
    message:
      process.env.NODE_ENV === "production"
        ? "An internal server error occurred"
        : error.message,
  });
};
