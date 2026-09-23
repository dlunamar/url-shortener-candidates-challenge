export class InvalidUrlError extends Error {
  readonly code = "INVALID_URL";

  constructor(message = "Invalid URL") {
    super(message);
    this.name = "InvalidUrlError";
  }
}

export class InvalidCodeError extends Error {
  readonly code = "INVALID_CODE";

  constructor(message = "Invalid short code") {
    super(message);
    this.name = "InvalidCodeError";
  }
}

export class UrlNotFoundError extends Error {
  readonly code = "URL_NOT_FOUND";

  constructor(message = "Short URL not found") {
    super(message);
    this.name = "UrlNotFoundError";
  }
}

export class CodeCollisionError extends Error {
  readonly code = "CODE_COLLISION";

  constructor(message = "Could not generate a unique short code") {
    super(message);
    this.name = "CodeCollisionError";
  }
}
