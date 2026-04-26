import type { ContentfulStatusCode } from 'hono/utils/http-status'

export class AppError extends Error {
    public statusCode: ContentfulStatusCode
    public code?: string
    public details?: unknown

    constructor(
        message: string,
        statusCode: ContentfulStatusCode = 500,
        code?: string,
        details?: unknown
    ) {
        super(message)
        this.statusCode = statusCode
        this.code = code
        this.details = details

        Error.captureStackTrace(this, this.constructor)
    }
}

export class BadRequestError extends AppError {
    constructor(message = 'Bad Request', details?: unknown) {
        super(message, 400, 'BAD_REQUEST', details)
    }
}

export class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401, 'UNAUTHORIZED')
    }
}

export class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403, 'FORBIDDEN')
    }
}

export class NotFoundError extends AppError {
    constructor(message = 'Resource Not Found') {
        super(message, 404, 'NOT_FOUND')
    }
}

export class ConflictError extends AppError {
    constructor(message = 'Conflict') {
        super(message, 409, 'CONFLICT')
    }
}

export class UnprocessableEntityError extends AppError {
    constructor(message = 'Unprocessable Entity', details?: unknown) {
        super(message, 422, 'UNPROCESSABLE_ENTITY', details)
    }
}

export class TooManyRequestsError extends AppError {
    constructor(message = 'Too Many Requests') {
        super(message, 429, 'TOO_MANY_REQUESTS')
    }
}

export class InternalServerError extends AppError {
    constructor(message = 'Internal Server Error') {
        super(message, 500, 'INTERNAL_SERVER_ERROR')
    }
}