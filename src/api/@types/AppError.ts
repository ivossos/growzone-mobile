interface ErrorDetail {
  loc: string[];
  msg: string;
  type: string;
}

interface ErrorResponse {
  detail: ErrorDetail[];
}

export class AppError {
  message: string;
  details: ErrorDetail[];

  constructor(errorResponse: ErrorResponse) {
    this.message = errorResponse.detail.map((err) => err.msg).join(", ");
    this.details = errorResponse.detail;
  }

  getMessagesByField(field: string): string[] {
    return this.details
      .filter((error) => error.loc.includes(field))
      .map((error) => error.msg);
  }
}