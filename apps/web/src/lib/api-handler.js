import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { AppError } from "./errors";
import { ZodError } from "zod";

/**
 * A higher-order function to wrap Next.js API route handlers.
 * It provides centralized error handling, catching exceptions 
 * and formatting them into standard JSON responses.
 * 
 * @param {Function} handler - The route handler function (req, res) => Promise<NextResponse>
 * @returns {Function} A wrapped Next.js App Router handler
 */
export function withErrorHandler(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      console.error(`[API Error] ${req.method} ${req.url}:`, error);

      // Handle Zod Validation Errors
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation Error",
            code: "VALIDATION_ERROR",
            details: error.errors,
          },
          { status: 400 }
        );
      }

      // Handle custom AppErrors
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            details: error.details || null,
          },
          { status: error.statusCode }
        );
      }

      // Handle unexpected/unhandled errors gracefully without leaking stack traces in production
      return NextResponse.json(
        {
          error: "Internal Server Error",
          code: "INTERNAL_SERVER_ERROR",
        },
        { status: 500 }
      );
    }
  };
}

/**
 * A higher-order function that ensures a user is authenticated before
 * executing the handler. If not authenticated, returns 401 Unauthorized.
 * If authenticated, it injects the session into the handler's context.
 * 
 * @param {Function} handler - (req, context, session) => Promise<NextResponse>
 * @returns {Function} A wrapped handler wrapped in withErrorHandler
 */
export function withApiAuth(handler) {
  const authHandler = async (req, context) => {
    // Note: In Next.js app directory API routes, getServerSession requires authOptions
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }

    return await handler(req, context, session);
  };

  return withErrorHandler(authHandler);
}
