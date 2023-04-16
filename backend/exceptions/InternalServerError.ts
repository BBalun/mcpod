export class InternalServerError extends Error {
  public cause: string | undefined = undefined;

  constructor({ message, cause }: { message: string; cause?: string }) {
    super(message);
    this.cause = cause;
  }
}

export function isInternalServerError(error: unknown): error is InternalServerError {
  return error instanceof InternalServerError;
}
