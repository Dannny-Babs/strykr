export class HttpError extends Error {
  constructor(message: string, public readonly status: number, public readonly headers?: HeadersInit) {
    super(message);
    this.name = "HttpError";
  }
}
