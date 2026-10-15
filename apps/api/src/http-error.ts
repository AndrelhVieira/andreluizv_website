/** An error the error handler turns into a response with this status and extra fields */
export interface HttpError extends Error {
  statusCode: number
  details?: Record<string, unknown>
}

export function httpError(
  statusCode: number,
  message: string,
  details?: Record<string, unknown>
): HttpError {
  return Object.assign(new Error(message), { statusCode, details })
}
